-- Restore automatic VALU readiness processing and marketplace listing refreshes.
-- Re-enqueue mutations must reopen already-processed rows; otherwise a profile's
-- first successful refresh permanently suppresses later eligibility changes.
begin;

create or replace function private.request_professional_readiness_refresh()
returns trigger
language plpgsql
security definer
set search_path = public, private
as $function$
declare
  target_id uuid;
begin
  target_id := coalesce(new.professional_id, new.id, old.professional_id, old.id);

  if target_id is null then
    raise exception 'Cannot enqueue readiness refresh without professional id';
  end if;

  insert into public.professional_readiness_refresh_queue (
    professional_id,
    reason,
    requested_at,
    processed_at,
    attempts,
    last_error,
    next_attempt_at
  )
  values (
    target_id,
    tg_table_name,
    now(),
    null,
    0,
    null,
    now()
  )
  on conflict (professional_id) do update
    set reason = excluded.reason,
        requested_at = excluded.requested_at,
        processed_at = null,
        attempts = 0,
        last_error = null,
        next_attempt_at = now();

  if tg_op = 'DELETE' then
    return old;
  end if;

  return new;
end;
$function$;

revoke all on function private.request_professional_readiness_refresh() from public, anon, authenticated;
grant execute on function private.request_professional_readiness_refresh() to service_role;

-- Reconcile every existing profile once through the same governed readiness worker.
insert into public.professional_readiness_refresh_queue (
  professional_id,
  reason,
  requested_at,
  processed_at,
  attempts,
  last_error,
  next_attempt_at
)
select
  p.id,
  'marketplace_auto_listing_reconciliation',
  now(),
  null,
  0,
  null,
  now()
from public.professional_profiles p
on conflict (professional_id) do update
  set reason = excluded.reason,
      requested_at = excluded.requested_at,
      processed_at = null,
      attempts = 0,
      last_error = null,
      next_attempt_at = now();

-- The readiness queue previously had no active scheduled consumer.
-- Run the privileged database worker directly; no HTTP secret or external service is needed.
do $schedule$
declare
  existing_job_id bigint;
begin
  select jobid
    into existing_job_id
    from cron.job
   where jobname = 'valoria-professional-readiness-refresh';

  if existing_job_id is not null then
    perform cron.unschedule(existing_job_id);
  end if;

  perform cron.schedule(
    'valoria-professional-readiness-refresh',
    '* * * * *',
    'select private.refresh_professional_readiness_queue(100);'
  );
end;
$schedule$;

commit;
