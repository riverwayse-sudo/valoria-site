-- Provide public.check_rate_limit, the shared limiter the site's public forms call.
--
-- WHY THIS EXISTS
-- Five routes call supabase.rpc('check_rate_limit', ...) — /api/waitlist,
-- /api/enquiries, /api/session-registration, /api/welcome-email and
-- /api/careers/applications. The function is defined in no migration in either
-- repository, so it can only have been created by hand in whatever database the
-- routes were tested against. Every environment therefore depends on untracked
-- DDL: a fresh staging or production project has no such function, and each
-- route fails according to its own fallback (waitlist, enquiries and
-- session-registration fail open and become unmetered; welcome-email and
-- careers/applications fail closed and return 503).
--
-- Contract required by those five call sites, verified by reading each one:
--   named args  p_key text, p_max_count integer, p_window_seconds integer
--   returns     boolean — true when the request is within budget
--
-- An earlier draft reused public.opportunity_submission_rate_limits. That is
-- wrong: its key_hash column is validated as at least 32 characters by
-- consume_opportunity_submission_rate_limit, while these callers pass short
-- literal keys such as 'waitlist:203.0.113.11'. Sharing the table would corrupt
-- the opportunity limiter's key invariant, so this uses a dedicated table.
--
-- Deliberately NOT named consume_*: the two existing limiters
-- (consume_rate_limit in the platform, consume_opportunity_submission_rate_limit
-- here) both increment and report in one statement, and the name records that.
-- This function must only *check* — the callers read the boolean and decide
-- themselves — so a name implying consumption would mislead.
--
-- First-request concurrency: `select ... for update` locks nothing when the row
-- does not exist yet, so a plain `if not found then insert` lets two concurrent
-- first requests for the same brand-new key both reach the insert, and one
-- raises a unique violation. The route then sees an RPC error and takes its
-- failure fallback (503 on the two fail-closed routes). The upsert below makes
-- row creation atomic, and the following `for update` then serialises callers.

create table if not exists public.rate_limit_buckets (
  rate_key text primary key,
  window_started_at timestamptz not null default now(),
  request_count integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.rate_limit_buckets enable row level security;
revoke all on table public.rate_limit_buckets from public, anon, authenticated;

create or replace function public.check_rate_limit(
  p_key text,
  p_max_count integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_now timestamptz := clock_timestamp();
  v_row public.rate_limit_buckets%rowtype;
begin
  if p_key is null or length(p_key) < 3 or length(p_key) > 300 then
    raise exception 'invalid rate limit key';
  end if;
  if p_max_count is null or p_max_count < 1 or p_max_count > 10000 then
    raise exception 'invalid rate limit maximum';
  end if;
  if p_window_seconds is null or p_window_seconds < 1 or p_window_seconds > 86400 then
    raise exception 'invalid rate limit window';
  end if;

  -- Create the bucket if it is missing. `on conflict do nothing` makes this safe
  -- when two first requests for the same new key arrive together: one inserts,
  -- the other becomes a no-op instead of raising a unique violation. A bare
  -- `if not found then insert` cannot do this, because the preceding
  -- `select ... for update` locks nothing for a row that does not yet exist.
  insert into public.rate_limit_buckets(rate_key, window_started_at, request_count, updated_at)
  values (p_key, v_now, 0, v_now)
  on conflict (rate_key) do nothing;

  -- Now the row exists, so this lock is real and serialises concurrent callers
  -- on the same key. Without it two simultaneous submissions could both read
  -- count = limit - 1 and both be allowed.
  select * into v_row
  from public.rate_limit_buckets
  where rate_key = p_key
  for update;

  if v_row.window_started_at <= v_now - make_interval(secs => p_window_seconds) then
    update public.rate_limit_buckets
    set window_started_at = v_now, request_count = 1, updated_at = v_now
    where rate_key = p_key;
    return true;
  end if;

  -- Budget already spent within the window: refuse without incrementing, so a
  -- caller that is being hammered cannot extend its own lockout indefinitely.
  if v_row.request_count >= p_max_count then
    update public.rate_limit_buckets
    set updated_at = v_now
    where rate_key = p_key;
    return false;
  end if;

  update public.rate_limit_buckets
  set request_count = request_count + 1, updated_at = v_now
  where rate_key = p_key;
  return true;
end;
$$;

-- The function is SECURITY DEFINER and is only ever called with the service-role
-- key from server routes. Anonymous and authenticated browser roles must not be
-- able to call it: that would let a visitor probe or exhaust another key's
-- budget, and would turn the limiter into a resource-exhaustion target.
revoke all on function public.check_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.check_rate_limit(text, integer, integer) to service_role;

create index if not exists rate_limit_buckets_updated_idx
  on public.rate_limit_buckets(updated_at);
