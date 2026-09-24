-- Marketplace discoverability is based on an authoritative completed VALU assessment,
-- active capability, public/listed state and admin governance.
-- Profile completion/avatar completion remains a separate completion/reminder workflow.

create or replace function private.evaluate_professional_capability(p_professional_id uuid,p_capability text)
returns jsonb language plpgsql security definer set search_path = public, private
as $$
declare missing jsonb := '[]'::jsonb; profile_ok boolean := false; valu_ok boolean := false; blocked boolean := false; eligible boolean := false; cap text := lower(trim(p_capability)); p record;
begin
  if cap='candidate' then cap:='talent'; end if;
  select * into p from public.professional_profiles where id=p_professional_id;
  if not found then return jsonb_build_object('professional_id',p_professional_id,'capability',cap,'eligible',false,'blocked',false,'missing',jsonb_build_array('profile')); end if;
  profile_ok := nullif(trim(coalesce(p.display_name,'')),'') is not null
    and cardinality(coalesce(p.active_tracks,'{}'::text[])) > 0;
  valu_ok := private.valu_assessment_is_current(p_professional_id);
  select coalesce((select plc.admin_revoked from public.professional_listing_controls plc where plc.professional_id=p_professional_id),false) into blocked;
  if not profile_ok then missing:=missing||jsonb_build_array('profile_identity'); end if;
  if not valu_ok then missing:=missing||jsonb_build_array('valu_assessment_score_35_current'); end if;
  if cap='speaker' then
    if coalesce(array_length(p.topics,1),0)=0 then missing:=missing||jsonb_build_array('speaker_topics'); end if;
    if coalesce(array_length(p.format_capabilities,1),0)=0 then missing:=missing||jsonb_build_array('speaker_formats'); end if;
    if coalesce(array_length(p.audience_sizes,1),0)=0 then missing:=missing||jsonb_build_array('speaker_audience_size'); end if;
  elsif cap='facilitator' then
    if coalesce(array_length(p.topics,1),0)=0 and coalesce(array_length(p.facilitation_topics,1),0)=0 then missing:=missing||jsonb_build_array('facilitator_topics'); end if;
    if coalesce(array_length(p.programme_types,1),0)=0 then missing:=missing||jsonb_build_array('facilitator_programme_types'); end if;
  elsif cap<>'talent' then
    missing:=missing||jsonb_build_array('unsupported_capability');
  end if;
  eligible:=jsonb_array_length(missing)=0 and not blocked;
  return jsonb_build_object('professional_id',p_professional_id,'capability',cap,'eligible',eligible,'blocked',blocked,'missing',missing);
end;
$$;

create or replace function private.evaluate_professional_readiness(p_professional_id uuid)
returns jsonb language plpgsql security definer set search_path = public, private
as $$
declare missing jsonb := '[]'::jsonb; valu_ok boolean := false; blocked boolean := false; eligible boolean := false; p record;
begin
 select * into p from public.professional_profiles where id=p_professional_id;
 if not found then return jsonb_build_object('professional_id',p_professional_id,'profile_complete',false,'full_assessment_complete',false,'full_assessment_required_for_general_listing',true,'blocked',false,'eligible',false,'missing',jsonb_build_array('profile')); end if;
 valu_ok:=private.valu_assessment_is_current(p_professional_id);
 select exists(select 1 from public.professional_listing_events e where e.professional_id=p_professional_id and e.event_type in ('ADMIN_REVOKED','ADMIN_SUSPENDED')
   and e.created_at=(select max(e2.created_at) from public.professional_listing_events e2 where e2.professional_id=p_professional_id)) into blocked;
 if nullif(trim(coalesce(p.display_name,'')),'') is null then missing:=missing||jsonb_build_array('display_name'); end if;
 if cardinality(coalesce(p.active_tracks,'{}'::text[]))=0 then missing:=missing||jsonb_build_array('track'); end if;
 if not valu_ok then missing:=missing||jsonb_build_array('full_valu_assessment_score_35_current'); end if;
 eligible:=jsonb_array_length(missing)=0 and not blocked;
 return jsonb_build_object('professional_id',p_professional_id,'profile_complete',coalesce(p.profile_complete,false),'full_assessment_complete',valu_ok,'full_assessment_required_for_general_listing',true,'blocked',blocked,'eligible',eligible,'missing',missing);
end;
$$;

do $$
declare r record;
begin
  for r in select id from public.professional_profiles where assessment_completed_at is not null and listing_status='listed' order by id loop
    perform private.sync_professional_listing_status(r.id);
  end loop;
end
$$;
