-- Ensure every automatic readiness refresh also recalculates each active capability.
-- The previous account-level worker updated professional listing state but never
-- invoked the capability evaluator, leaving every capability permanently unlisted.
begin;

create or replace function private.sync_professional_listing_status(p_professional_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, private
as $function$
declare
  p record;
  cap record;
  cap_result jsonb;
  capability_results jsonb := '[]'::jsonb;
  assessment_ok boolean := false;
  basic_taster_ok boolean := false;
  blocked boolean := false;
  next_status text;
  listed_capability_count integer := 0;
begin
  select *
    into p
    from public.professional_profiles
   where id = p_professional_id
   for update;

  if not found then
    return jsonb_build_object('ok', false, 'professional_id', p_professional_id);
  end if;

  assessment_ok := private.valu_assessment_is_current(p_professional_id);

  basic_taster_ok :=
    coalesce(p.is_test, false) = false
    and exists (
      select 1
        from public.taster_sessions t
       where t.user_id = p_professional_id
         and t.completed_at is not null
    );

  select
    exists (
      select 1
        from public.professional_listing_events e
       where e.professional_id = p_professional_id
         and e.event_type in ('ADMIN_REVOKED', 'ADMIN_SUSPENDED')
         and e.created_at = (
           select max(e2.created_at)
             from public.professional_listing_events e2
            where e2.professional_id = p_professional_id
         )
    )
    or coalesce((
      select plc.admin_revoked
        from public.professional_listing_controls plc
       where plc.professional_id = p_professional_id
    ), false)
    into blocked;

  -- Recalculate every active capability against current profile, VALU and
  -- approved evidence. Capability eligibility remains separate from general
  -- marketplace presence.
  for cap in
    select pc.capability
      from public.professional_capabilities pc
     where pc.professional_id = p_professional_id
       and pc.is_active = true
     order by pc.capability
  loop
    cap_result := private.sync_professional_capability(p_professional_id, cap.capability);
    capability_results := capability_results || jsonb_build_array(cap_result);
  end loop;

  select count(*)
    into listed_capability_count
    from public.professional_capabilities pc
   where pc.professional_id = p_professional_id
     and pc.is_active = true
     and pc.eligible_for_listing = true
     and pc.eligibility_status = 'listed';

  if (assessment_ok or basic_taster_ok) and not blocked then
    next_status := 'listed';
  elsif p.listing_status in ('listed', 'pending') then
    next_status := 'unlisted';
  else
    next_status := p.listing_status;
  end if;

  update public.professional_profiles
     set eligible_for_listing = (next_status = 'listed'),
         listing_status = next_status,
         visibility = case
           when next_status = 'listed' then 'public'
           when next_status = 'unlisted' and visibility = 'public' then 'registered_only'
           else visibility
         end,
         listed_at = case
           when next_status = 'listed' and listed_at is null then now()
           when next_status <> 'listed' then null
           else listed_at
         end,
         updated_at = now()
   where id = p_professional_id;

  return jsonb_build_object(
    'ok', true,
    'professional_id', p_professional_id,
    'eligible_for_listing', (next_status = 'listed'),
    'listing_status', next_status,
    'full_assessment_complete', assessment_ok,
    'basic_taster_complete', basic_taster_ok,
    'blocked', blocked,
    'listed_capability_count', listed_capability_count,
    'capability_results', capability_results
  );
end;
$function$;

revoke all on function private.sync_professional_listing_status(uuid) from public, anon, authenticated;
grant execute on function private.sync_professional_listing_status(uuid) to service_role;

commit;
