-- Default avatars are a UI fallback, not stored profile photos.
-- A profile is complete without an uploaded photo; the UI renders a Valoria
-- default avatar whenever photo_url is null. This keeps photo_url semantically
-- accurate and prevents profile visibility from depending on media upload.

create or replace function public.enforce_valu_profile_lifecycle()
returns trigger language plpgsql security definer set search_path = public, private
as $function$
begin
  if tg_op='INSERT' and coalesce(new.listing_status,'pending')='pending' then
    new.listing_status:='unlisted';
  end if;

  new.profile_complete :=
    nullif(trim(coalesce(new.display_name,'')),'') is not null
    and nullif(trim(coalesce(new.headline,'')),'') is not null
    and nullif(trim(coalesce(new.bio,'')),'') is not null
    and cardinality(coalesce(new.active_tracks,'{}'::text[]))>0
    and nullif(trim(coalesce(new.industry,'')),'') is not null
    and nullif(trim(coalesce(new.username,'')),'') is not null
    and nullif(trim(coalesce(new.phone,'')),'') is not null
    and nullif(trim(coalesce(new.current_job_title,'')),'') is not null
    and nullif(trim(coalesce(new.location,'')),'') is not null
    and coalesce(array_length(new.languages,1),0)>0;

  return new;
end
$function$;

create or replace function private.evaluate_professional_capability(p_professional_id uuid,p_capability text)
returns jsonb language plpgsql security definer set search_path = public, private
as $function$
declare
  missing jsonb := '[]'::jsonb;
  profile_ok boolean := false;
  valu_ok boolean := false;
  blocked boolean := false;
  eligible boolean := false;
  cap text := lower(trim(p_capability));
  p record;
begin
  if cap='candidate' then cap:='talent'; end if;
  select * into p from public.professional_profiles where id=p_professional_id;
  if not found then
    return jsonb_build_object('professional_id',p_professional_id,'capability',cap,'eligible',false,'blocked',false,'missing',jsonb_build_array('profile'));
  end if;

  profile_ok := coalesce(p.profile_complete,false)
    and nullif(trim(coalesce(p.display_name,'')),'') is not null
    and nullif(trim(coalesce(p.headline,'')),'') is not null
    and nullif(trim(coalesce(p.bio,'')),'') is not null
    and cardinality(coalesce(p.active_tracks,'{}'::text[])) > 0;
  valu_ok := private.valu_assessment_is_current(p_professional_id);
  select coalesce((select plc.admin_revoked from public.professional_listing_controls plc where plc.professional_id=p_professional_id),false)
    into blocked;

  if not exists(select 1 from public.professional_capabilities where professional_id=p_professional_id and capability=cap and is_active)
    then missing:=missing||jsonb_build_array('capability'); end if;
  if not profile_ok then missing:=missing||jsonb_build_array('profile'); end if;
  if not valu_ok then missing:=missing||jsonb_build_array('valu_assessment_score_35_current'); end if;

  if cap='talent' then
    if nullif(trim(coalesce(p.cv_url,'')),'') is null then missing:=missing||jsonb_build_array('talent_cv'); end if;
  elsif cap='speaker' then
    if coalesce(array_length(p.topics,1),0)=0 then missing:=missing||jsonb_build_array('speaker_topics'); end if;
    if coalesce(array_length(p.format_capabilities,1),0)=0 then missing:=missing||jsonb_build_array('speaker_formats'); end if;
    if coalesce(array_length(p.audience_sizes,1),0)=0 then missing:=missing||jsonb_build_array('speaker_audience_size'); end if;
  elsif cap='facilitator' then
    if coalesce(array_length(p.topics,1),0)=0 and coalesce(array_length(p.facilitation_topics,1),0)=0 then missing:=missing||jsonb_build_array('facilitator_topics'); end if;
    if coalesce(array_length(p.programme_types,1),0)=0 then missing:=missing||jsonb_build_array('facilitator_programme_types'); end if;
  else
    missing:=missing||jsonb_build_array('unsupported_capability');
  end if;

  eligible:=jsonb_array_length(missing)=0 and not blocked;
  return jsonb_build_object('professional_id',p_professional_id,'capability',cap,'eligible',eligible,'blocked',blocked,'missing',missing);
end
$function$;

create or replace function private.evaluate_professional_readiness(p_professional_id uuid)
returns jsonb language plpgsql security definer set search_path = public, private
as $function$
declare
  missing jsonb := '[]'::jsonb;
  profile_ok boolean := false;
  valu_ok boolean := false;
  blocked boolean := false;
  eligible boolean := false;
  p record;
begin
  select * into p from public.professional_profiles where id=p_professional_id;
  if not found then
    return jsonb_build_object('professional_id',p_professional_id,'profile_complete',false,'full_assessment_complete',false,'full_assessment_required_for_general_listing',true,'blocked',false,'eligible',false,'missing',jsonb_build_array('profile'));
  end if;

  profile_ok := coalesce(p.profile_complete,false)
    and nullif(trim(coalesce(p.display_name,'')),'') is not null
    and nullif(trim(coalesce(p.headline,'')),'') is not null
    and nullif(trim(coalesce(p.bio,'')),'') is not null
    and cardinality(coalesce(p.active_tracks,'{}'::text[])) > 0
    and nullif(trim(coalesce(p.industry,'')),'') is not null
    and nullif(trim(coalesce(p.username,'')),'') is not null
    and nullif(trim(coalesce(p.phone,'')),'') is not null
    and nullif(trim(coalesce(p.current_job_title,'')),'') is not null
    and nullif(trim(coalesce(p.location,'')),'') is not null
    and coalesce(array_length(p.languages,1),0) > 0
    and nullif(trim(coalesce(p.cv_url,'')),'') is not null;
  valu_ok:=private.valu_assessment_is_current(p_professional_id);

  select exists(
    select 1 from public.professional_listing_events e
    where e.professional_id=p_professional_id
      and e.event_type in ('ADMIN_REVOKED','ADMIN_SUSPENDED')
      and e.created_at=(select max(e2.created_at) from public.professional_listing_events e2 where e2.professional_id=p_professional_id)
  ) into blocked;

  if not profile_ok then missing:=missing||jsonb_build_array('profile'); end if;
  if not valu_ok then missing:=missing||jsonb_build_array('full_valu_assessment_score_35_current'); end if;
  if cardinality(coalesce(p.active_tracks,'{}'::text[]))=0 then missing:=missing||jsonb_build_array('track'); end if;
  if nullif(trim(coalesce(p.cv_url,'')),'') is null then missing:=missing||jsonb_build_array('cv_url'); end if;

  eligible:=jsonb_array_length(missing)=0 and not blocked;
  return jsonb_build_object('professional_id',p_professional_id,'profile_complete',profile_ok,'full_assessment_complete',valu_ok,'full_assessment_required_for_general_listing',true,'blocked',blocked,'eligible',eligible,'missing',missing);
end
$function$;

update public.professional_profiles
set profile_complete = profile_complete
where id is not null;
