-- Restore the ownership/timestamp contract consumed by the signed-in journey UI.
-- Historical rows remain unowned until reconciled with reliable identity evidence.
alter table public.assessment_sessions
  add column if not exists user_id uuid references auth.users(id) on delete set null,
  add column if not exists updated_at timestamptz not null default now();

create index if not exists assessment_sessions_user_updated_idx
  on public.assessment_sessions (user_id, updated_at desc);

create or replace function public.assessment_sessions_touch_updated_at()
returns trigger
language plpgsql
set search_path = public
as $function$
begin
  new.updated_at := now();
  return new;
end;
$function$;

drop trigger if exists assessment_sessions_touch_updated_at on public.assessment_sessions;
create trigger assessment_sessions_touch_updated_at
before update on public.assessment_sessions
for each row execute function public.assessment_sessions_touch_updated_at();

alter table public.assessment_sessions enable row level security;

drop policy if exists assessment_sessions_owner_read on public.assessment_sessions;
create policy assessment_sessions_owner_read
  on public.assessment_sessions
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

-- Deliberately no client INSERT/UPDATE/DELETE policies: this legacy table is
-- written by trusted server-side assessment processing only. Unlinked legacy
-- rows remain invisible to end users until identity reconciliation verifies ownership.
-- Do not backfill user_id by name alone.
revoke all on function public.assessment_sessions_touch_updated_at() from public, anon, authenticated;
grant select on public.assessment_sessions to authenticated;
