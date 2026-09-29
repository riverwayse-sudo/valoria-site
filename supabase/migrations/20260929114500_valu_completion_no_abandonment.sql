alter table public.valu_assessments
  add column if not exists profile_reminder_count integer not null default 0,
  add column if not exists last_profile_reminder_at timestamptz;

create or replace function public.refresh_professional_journey(p_user_id uuid)
returns public.professional_journey
language plpgsql security definer set search_path = public
as $function$
declare a record; p record; cap_count integer:=0; evidence_count integer:=0; eligible_count integer:=0;
v_state text:='registered'; v_eligibility text:='not_started'; v_profile_ready boolean:=false;
v_capability_selected boolean:=false; v_evidence_submitted boolean:=false; v_marketplace_ready boolean:=false;
result_row public.professional_journey;
begin
select * into a from public.valu_assessments where user_id=p_user_id and completed_at is not null order by completed_at desc limit 1;
select * into p from public.professional_profiles where id=p_user_id;
select count(*) into cap_count from public.professional_capabilities where professional_id=p_user_id and is_active=true;
select count(*) into evidence_count from public.professional_documents where professional_id=p_user_id and verification_status in ('verified','pending');
select count(*) into eligible_count from public.professional_capabilities where professional_id=p_user_id and is_active=true and eligible_for_listing=true and eligibility_status='listed';
v_profile_ready:=coalesce(p.profile_complete,false) or (p.id is not null and p.display_name is not null and p.current_job_title is not null);
v_capability_selected:=cap_count>0; v_evidence_submitted:=evidence_count>0;
v_marketplace_ready:=a.id is not null and p.id is not null and p.visibility='public' and p.listing_status='listed'
and not exists(select 1 from public.professional_listing_events e where e.professional_id=p_user_id and e.event_type in ('ADMIN_REVOKED','ADMIN_SUSPENDED')
and e.created_at=(select max(e2.created_at) from public.professional_listing_events e2 where e2.professional_id=p_user_id));
if v_marketplace_ready then v_state:=case when v_profile_ready then 'profile_ready' else 'listed' end; v_eligibility:='eligible';
elsif eligible_count>0 then v_state:='eligible'; v_eligibility:='eligible';
elsif exists(select 1 from public.professional_capabilities where professional_id=p_user_id and is_active=true and eligibility_status='pending') then v_state:='eligibility_review'; v_eligibility:='pending';
elsif v_evidence_submitted then v_state:='evidence_submitted'; v_eligibility:='pending';
elsif v_capability_selected then v_state:='capability_selected';
elsif v_profile_ready then v_state:='profile_ready';
elsif a.id is not null then v_state:='listed';
elsif p.id is not null then v_state:='profile_started'; end if;
insert into public.professional_journey(user_id,lifecycle_state,current_assessment_id,profile_ready,capability_selected,evidence_submitted,eligibility_state,marketplace_ready,last_evaluated_at,updated_at)
values(p_user_id,v_state,a.id,v_profile_ready,v_capability_selected,v_evidence_submitted,v_eligibility,v_marketplace_ready,now(),now())
on conflict(user_id) do update set lifecycle_state=excluded.lifecycle_state,current_assessment_id=excluded.current_assessment_id,profile_ready=excluded.profile_ready,capability_selected=excluded.capability_selected,evidence_submitted=excluded.evidence_submitted,eligibility_state=excluded.eligibility_state,marketplace_ready=excluded.marketplace_ready,last_evaluated_at=now(),updated_at=now()
returning * into result_row;
return result_row;
end;$function$;

do $backfill$ declare r record; begin for r in select id from public.professional_profiles loop perform public.refresh_professional_journey(r.id); end loop; end;$backfill$;