-- Keep profile completion as a distinct canonical journey state before capability/eligibility.
create or replace function public.refresh_professional_journey(p_user_id uuid)
returns public.professional_journey
language plpgsql
security definer
set search_path = ''
as $function$
declare
  a record; p record; latest_taster record; current_row public.professional_journey; result_row public.professional_journey;
  v_stage text := 'signed_up'; v_next_action text := 'Start your VALU journey'; v_progress smallint := 0;
  v_profile_ready boolean := false; v_capability_selected boolean := false; v_evidence_submitted boolean := false;
  v_marketplace_ready boolean := false; v_taster_started boolean := false; v_taster_completed boolean := false;
  v_full_started boolean := false; v_assessment_completed boolean := false;
  cap_count integer := 0; evidence_count integer := 0; eligible_count integer := 0;
begin
  select * into a from public.valu_assessments where user_id=p_user_id order by completed_at desc nulls last, created_at desc limit 1;
  select * into p from public.professional_profiles where id=p_user_id;
  select * into latest_taster from public.taster_sessions where user_id=p_user_id order by completed_at desc nulls last, created_at desc limit 1;

  v_taster_started := latest_taster.id is not null;
  v_taster_completed := latest_taster.completed_at is not null;
  v_full_started := a.id is not null;
  v_assessment_completed := a.completed_at is not null;

  select count(*) into cap_count from public.professional_capabilities where professional_id=p_user_id and is_active=true;
  select count(*) into evidence_count from public.professional_documents where professional_id=p_user_id and verification_status in ('verified','pending');
  select count(*) into eligible_count from public.professional_capabilities
    where professional_id=p_user_id and is_active=true and (eligible_for_listing=true or eligibility_status in ('eligible','listed'));

  v_profile_ready := coalesce(p.profile_complete,false);
  v_capability_selected := cap_count>0;
  v_evidence_submitted := evidence_count>0;
  v_marketplace_ready := p.id is not null
    and (p.listing_status='listed' or p.eligible_for_listing=true or eligible_count>0)
    and coalesce(p.visibility,'registered_only') in ('public','marketplace');

  if not v_full_started and v_taster_started and not v_taster_completed then
    v_stage:='taster_started'; v_next_action:='Continue your VALU snapshot'; v_progress:=10;
  elsif not v_full_started and v_taster_completed then
    v_stage:='taster_completed'; v_next_action:='Continue to your full VALU assessment'; v_progress:=20;
  elsif v_full_started and not v_assessment_completed then
    v_stage:='full_valu_started'; v_next_action:='Continue your VALU assessment'; v_progress:=30;
  elsif v_assessment_completed and p.id is null then
    v_stage:='full_valu_completed'; v_next_action:='Set up your Valoria marketplace profile'; v_progress:=50;
  elsif v_assessment_completed and p.id is not null and not v_profile_ready then
    v_stage:='profile_incomplete'; v_next_action:='Complete your professional profile'; v_progress:=65;
  elsif v_assessment_completed and p.id is not null and v_profile_ready and not v_capability_selected then
    v_stage:='profile_complete'; v_next_action:='Add your capability'; v_progress:=78;
  elsif v_assessment_completed and p.id is not null and v_profile_ready and (not v_marketplace_ready or eligible_count=0) then
    v_stage:='capability_eligibility'; v_next_action:='Complete your capability eligibility'; v_progress:=88;
  elsif v_assessment_completed and p.id is not null and v_profile_ready and v_marketplace_ready then
    v_stage:='marketplace_enhanced'; v_next_action:='Explore your Valoria opportunities'; v_progress:=100;
  elsif v_assessment_completed then
    v_stage:='marketplace_profile_created'; v_next_action:='Complete your professional profile'; v_progress:=55;
  end if;

  select * into current_row from public.professional_journey where user_id=p_user_id for update;

  insert into public.professional_journey (
    user_id,lifecycle_state,current_assessment_id,profile_ready,capability_selected,evidence_submitted,
    eligibility_state,marketplace_ready,journey_stage,stage_started_at,next_action,progress_percent,
    state_version,last_evaluated_at,updated_at
  ) values (
    p_user_id,
    case
      when v_stage='marketplace_enhanced' then 'listed'
      when v_stage='capability_eligibility' then case when eligible_count>0 then 'eligible' else 'capability_selected' end
      when v_stage in ('profile_complete','profile_incomplete','marketplace_profile_created') then 'profile_ready'
      when v_stage='full_valu_completed' then 'assessed'
      else 'registered'
    end,
    a.id,v_profile_ready,v_capability_selected,v_evidence_submitted,
    case when eligible_count>0 then 'eligible' when v_evidence_submitted then 'pending' else 'not_started' end,
    v_marketplace_ready,v_stage,
    case when current_row.user_id is null then now() when current_row.journey_stage is distinct from v_stage then now() else current_row.stage_started_at end,
    v_next_action,v_progress,1,now(),now()
  )
  on conflict(user_id) do update set
    lifecycle_state=excluded.lifecycle_state,current_assessment_id=excluded.current_assessment_id,profile_ready=excluded.profile_ready,
    capability_selected=excluded.capability_selected,evidence_submitted=excluded.evidence_submitted,eligibility_state=excluded.eligibility_state,
    marketplace_ready=excluded.marketplace_ready,journey_stage=excluded.journey_stage,stage_started_at=excluded.stage_started_at,
    next_action=excluded.next_action,progress_percent=excluded.progress_percent,state_version=1,last_evaluated_at=now(),updated_at=now()
  returning * into result_row;

  if current_row.user_id is not null and current_row.journey_stage is distinct from v_stage then
    insert into public.valoria_journey_events(user_id,event_key,source,source_id,metadata)
    values(p_user_id,'journey_state_changed','journey_state_engine',p_user_id::text,
      jsonb_build_object('from_stage',current_row.journey_stage,'to_stage',v_stage,'next_action',v_next_action,'progress_percent',v_progress,'state_version',1));
  end if;
  return result_row;
end;
$function$;

revoke execute on function public.refresh_professional_journey(uuid) from public,anon,authenticated;
grant execute on function public.refresh_professional_journey(uuid) to service_role;

do $backfill$
declare r record;
begin
  for r in select user_id from public.professional_journey loop
    perform public.refresh_professional_journey(r.user_id);
  end loop;
end;
$backfill$;