-- Keep every readiness enqueue path consistent: profile and assessment triggers
-- use enqueue_readiness_refresh(), while capability/evidence triggers use the
-- trigger-specific request function. Both must reopen previously processed work.
begin;

create or replace function private.enqueue_readiness_refresh(
  p_professional_id uuid,
  p_reason text
)
returns void
language sql
security definer
set search_path = public, private
as $function$
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
    p_professional_id,
    coalesce(nullif(trim(p_reason), ''), 'mutation'),
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
$function$;

revoke all on function private.enqueue_readiness_refresh(uuid, text) from public, anon, authenticated;
grant execute on function private.enqueue_readiness_refresh(uuid, text) to service_role;

commit;
