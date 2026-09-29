-- Abuse protection for the public opportunity intake endpoint.
create table if not exists public.opportunity_submission_rate_limits (
  key_hash text primary key,
  window_started_at timestamptz not null default now(),
  request_count integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.opportunity_submission_rate_limits enable row level security;
revoke all on public.opportunity_submission_rate_limits from public, anon, authenticated;

create or replace function public.consume_opportunity_submission_rate_limit(
  p_key_hash text,
  p_limit integer default 5,
  p_window_seconds integer default 3600
)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_row public.opportunity_submission_rate_limits%rowtype;
begin
  if p_key_hash is null or length(p_key_hash) < 32 then
    return false;
  end if;

  select * into v_row
  from public.opportunity_submission_rate_limits
  where key_hash = p_key_hash
  for update;

  if not found then
    insert into public.opportunity_submission_rate_limits(key_hash, request_count)
    values (p_key_hash, 1);
    return true;
  end if;

  if v_row.window_started_at <= now() - make_interval(secs => p_window_seconds) then
    update public.opportunity_submission_rate_limits
    set window_started_at = now(), request_count = 1, updated_at = now()
    where key_hash = p_key_hash;
    return true;
  end if;

  if v_row.request_count >= p_limit then
    update public.opportunity_submission_rate_limits
    set updated_at = now()
    where key_hash = p_key_hash;
    return false;
  end if;

  update public.opportunity_submission_rate_limits
  set request_count = request_count + 1, updated_at = now()
  where key_hash = p_key_hash;
  return true;
end;
$$;

revoke all on function public.consume_opportunity_submission_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.consume_opportunity_submission_rate_limit(text, integer, integer) to service_role;

create index if not exists opportunity_submission_rate_limits_updated_idx
  on public.opportunity_submission_rate_limits(updated_at);