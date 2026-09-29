-- Phase 2: unify every acquisition and progression entry point into the canonical Valoria journey.
-- Journey events are written by locked trigger functions so browser clients cannot forge them.
-- Re-entry tokens are resolved server-side and may be claimed after authentication.

create or replace function public.valoria_record_journey_event(
  p_user_id uuid,
  p_event_key text,
  p_source text,
  p_source_id text default null,
  p_metadata jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_event_key is null or p_source is null then return; end if;
  insert into public.valoria_journey_events(user_id,event_key,source,source_id,metadata)
  values(p_user_id,p_event_key,p_source,p_source_id,coalesce(p_metadata,'{}'::jsonb));
end;
$$;
revoke all on function public.valoria_record_journey_event(uuid,text,text,text,jsonb) from public, anon, authenticated;

create or replace function public.valoria_event_registration_continuity()
returns trigger language plpgsql security definer set search_path = ''
as $$
declare v_user_id uuid;
begin
  select id into v_user_id from auth.users where lower(email)=lower(new.email) order by created_at desc limit 1;
  perform public.valoria_record_journey_event(v_user_id,'event_registered','professional_standard_event_registration',new.id::text,
    jsonb_build_object('session_id',new.session_id,'email',new.email));
  return new;
end;
$$;
revoke all on function public.valoria_event_registration_continuity() from public, anon, authenticated;
drop trigger if exists trg_valoria_event_registration_continuity on public.professional_standard_event_registrations;
create trigger trg_valoria_event_registration_continuity after insert on public.professional_standard_event_registrations
for each row execute function public.valoria_event_registration_continuity();

create or replace function public.valoria_attendance_continuity()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  if new.attendance_status='present' then
    perform public.valoria_record_journey_event(new.professional_id,'event_attended','professional_event_attendance',new.id::text,
      jsonb_build_object('event_id',new.event_id,'attendance_source',new.attendance_source));
  end if;
  return new;
end;
$$;
revoke all on function public.valoria_attendance_continuity() from public, anon, authenticated;
drop trigger if exists trg_valoria_attendance_continuity on public.professional_event_attendance;
create trigger trg_valoria_attendance_continuity after insert or update of attendance_status on public.professional_event_attendance
for each row execute function public.valoria_attendance_continuity();

create or replace function public.valoria_certificate_continuity()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  perform public.valoria_record_journey_event(new.professional_id,'certificate_issued','professional_certificate',new.id::text,
    jsonb_build_object('certificate_number',new.certificate_number,'event_title',new.event_title));
  return new;
end;
$$;
revoke all on function public.valoria_certificate_continuity() from public, anon, authenticated;
drop trigger if exists trg_valoria_certificate_continuity on public.professional_certificates;
create trigger trg_valoria_certificate_continuity after insert on public.professional_certificates
for each row execute function public.valoria_certificate_continuity();

create or replace function public.valoria_taster_continuity()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  if new.completed_at is not null and (tg_op='INSERT' or old.completed_at is null) then
    perform public.valoria_record_journey_event(new.user_id,'taster_completed','taster_session',new.id::text,
      jsonb_build_object('strongest_cluster',new.strongest_cluster,'weakest_cluster',new.weakest_cluster));
  end if;
  return new;
end;
$$;
revoke all on function public.valoria_taster_continuity() from public, anon, authenticated;
drop trigger if exists trg_valoria_taster_continuity on public.taster_sessions;
create trigger trg_valoria_taster_continuity after insert or update of completed_at on public.taster_sessions
for each row execute function public.valoria_taster_continuity();

create or replace function public.valoria_assessment_continuity()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  if new.completed_at is not null and (tg_op='INSERT' or old.completed_at is null) then
    perform public.valoria_record_journey_event(new.user_id,'valu_completed','valu_assessment',new.id::text,
      jsonb_build_object('total_score',new.total_score,'assessment_version',new.assessment_version,'report_status',new.report_status));
  end if;
  return new;
end;
$$;
revoke all on function public.valoria_assessment_continuity() from public, anon, authenticated;
drop trigger if exists trg_valoria_assessment_continuity on public.valu_assessments;
create trigger trg_valoria_assessment_continuity after insert or update of completed_at on public.valu_assessments
for each row execute function public.valoria_assessment_continuity();

create or replace function public.valoria_profile_continuity()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  if tg_op='INSERT' then
    perform public.valoria_record_journey_event(new.id,'profile_started','professional_profile',new.id::text,'{}'::jsonb);
  elsif coalesce(new.profile_complete,false) and not coalesce(old.profile_complete,false) then
    perform public.valoria_record_journey_event(new.id,'profile_completed','professional_profile',new.id::text,'{}'::jsonb);
  end if;
  return new;
end;
$$;
revoke all on function public.valoria_profile_continuity() from public, anon, authenticated;
drop trigger if exists trg_valoria_profile_continuity on public.professional_profiles;
create trigger trg_valoria_profile_continuity after insert or update of profile_complete on public.professional_profiles
for each row execute function public.valoria_profile_continuity();

create or replace function public.valoria_capability_continuity()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  if tg_op='INSERT' then
    if coalesce(new.is_active,true) then
      perform public.valoria_record_journey_event(new.professional_id,'capability_selected','professional_capability',new.id::text,'{}'::jsonb);
    end if;
    if coalesce(new.eligible_for_listing,false) then
      perform public.valoria_record_journey_event(new.professional_id,'capability_eligible','professional_capability',new.id::text,
        jsonb_build_object('eligibility_status',new.eligibility_status));
    end if;
    if coalesce(new.eligibility_status,'')='listed' then
      perform public.valoria_record_journey_event(new.professional_id,'capability_listed','professional_capability',new.id::text,'{}'::jsonb);
    end if;
  else
    if coalesce(new.eligible_for_listing,false) and not coalesce(old.eligible_for_listing,false) then
      perform public.valoria_record_journey_event(new.professional_id,'capability_eligible','professional_capability',new.id::text,
        jsonb_build_object('eligibility_status',new.eligibility_status));
    end if;
    if coalesce(new.eligibility_status,'')='listed' and coalesce(old.eligibility_status,'')<>'listed' then
      perform public.valoria_record_journey_event(new.professional_id,'capability_listed','professional_capability',new.id::text,'{}'::jsonb);
    end if;
  end if;
  return new;
end;
$$;
revoke all on function public.valoria_capability_continuity() from public, anon, authenticated;
drop trigger if exists trg_valoria_capability_continuity on public.professional_capabilities;
create trigger trg_valoria_capability_continuity after insert or update of is_active,eligible_for_listing,eligibility_status on public.professional_capabilities
for each row execute function public.valoria_capability_continuity();

create or replace function public.valoria_opportunity_continuity()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  if new.submitter_user_id is not null then
    perform public.valoria_record_journey_event(new.submitter_user_id,'opportunity_engaged','opportunity_submission',new.id::text,
      jsonb_build_object('opportunity_id',new.opportunity_id,'status',new.status));
  end if;
  return new;
end;
$$;
revoke all on function public.valoria_opportunity_continuity() from public, anon, authenticated;
drop trigger if exists trg_valoria_opportunity_continuity on public.opportunity_submissions;
create trigger trg_valoria_opportunity_continuity after insert on public.opportunity_submissions
for each row execute function public.valoria_opportunity_continuity();

create or replace function public.valoria_journey_state_continuity()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  if new.lifecycle_state is distinct from old.lifecycle_state
     or new.eligibility_state is distinct from old.eligibility_state
     or new.marketplace_ready is distinct from old.marketplace_ready then
    perform public.valoria_record_journey_event(new.user_id,'journey_state_changed','professional_journey',new.user_id::text,
      jsonb_build_object('from',old.lifecycle_state,'to',new.lifecycle_state,'eligibility_state',new.eligibility_state,'marketplace_ready',new.marketplace_ready));
  end if;
  return new;
end;
$$;
revoke all on function public.valoria_journey_state_continuity() from public, anon, authenticated;
drop trigger if exists trg_valoria_journey_state_continuity on public.professional_journey;
create trigger trg_valoria_journey_state_continuity after update of lifecycle_state,eligibility_state,marketplace_ready on public.professional_journey
for each row execute function public.valoria_journey_state_continuity();

create or replace function public.valoria_auth_user_continuity()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  perform public.valoria_record_journey_event(new.id,'account_created','auth_user',new.id::text,
    jsonb_build_object('email_confirmed',new.email_confirmed_at is not null));
  return new;
end;
$$;
revoke all on function public.valoria_auth_user_continuity() from public, anon, authenticated;
drop trigger if exists trg_valoria_auth_user_continuity on auth.users;
create trigger trg_valoria_auth_user_continuity after insert on auth.users
for each row execute function public.valoria_auth_user_continuity();
