-- Marketplace eligibility requires approved evidence for the specific capability.
-- The existing professional_documents triggers already queue capability readiness
-- recalculation whenever evidence is inserted or reviewed.
create or replace function private.evaluate_professional_capability(
  p_professional_id uuid,
  p_capability text
)
returns jsonb
language plpgsql
security definer
set search_path to 'public', 'private'
as $function$
declare
  missing jsonb := '[]'::jsonb;
  profile_ok boolean := false;
  valu_ok boolean := false;
  blocked boolean := false;
  eligible boolean := false;
  cap text := lower(trim(p_capability));
  p record;
  capability_row_id uuid;
  approved_evidence boolean := false;
begin
  if cap='candidate' then cap:='talent'; end if;

  select * into p
  from public.professional_profiles
  where id=p_professional_id;

  if not found then
    return jsonb_build_object(
      'professional_id',p_professional_id,
      'capability',cap,
      'eligible',false,
      'blocked',false,
      'missing',jsonb_build_array('profile')
    );
  end if;

  profile_ok := coalesce(p.profile_complete,false)
    and nullif(trim(coalesce(p.display_name,'')),'') is not null
    and nullif(trim(coalesce(p.headline,'')),'') is not null
    and nullif(trim(coalesce(p.bio,'')),'') is not null
    and cardinality(coalesce(p.active_tracks,'{}'::text[])) > 0;

  valu_ok := private.valu_assessment_is_current(p_professional_id);

  select coalesce((
    select plc.admin_revoked
    from public.professional_listing_controls plc
    where plc.professional_id=p_professional_id
  ),false) into blocked;

  select pc.id into capability_row_id
  from public.professional_capabilities pc
  where pc.professional_id=p_professional_id
    and pc.capability=cap
    and pc.is_active=true
  limit 1;

  if capability_row_id is null then
    missing:=missing||jsonb_build_array('capability');
  end if;
  if not profile_ok then
    missing:=missing||jsonb_build_array('profile');
  end if;
  if not valu_ok then
    missing:=missing||jsonb_build_array('valu_assessment_score_35_current');
  end if;

  if cap='talent' then
    if nullif(trim(coalesce(p.cv_url,'')),'') is null then
      missing:=missing||jsonb_build_array('talent_cv');
    else
      select exists(
        select 1
        from public.professional_documents d
        where d.professional_id=p_professional_id
          and d.document_type='cv'
          and d.storage_bucket='cvs'
          and d.visibility='private'
          and d.capability_id is null
          and d.storage_path=p.cv_url
          and d.verification_status='verified'
      ) into approved_evidence;
      if not approved_evidence then
        missing:=missing||jsonb_build_array('talent_cv_approval');
      end if;
    end if;

  elsif cap='speaker' then
    if coalesce(array_length(p.topics,1),0)=0 then
      missing:=missing||jsonb_build_array('speaker_topics');
    end if;
    if coalesce(array_length(p.format_capabilities,1),0)=0 then
      missing:=missing||jsonb_build_array('speaker_formats');
    end if;
    if coalesce(array_length(p.audience_sizes,1),0)=0 then
      missing:=missing||jsonb_build_array('speaker_audience_size');
    end if;

    if capability_row_id is not null then
      select exists(
        select 1
        from public.professional_documents d
        where d.professional_id=p_professional_id
          and d.capability_id=capability_row_id
          and d.storage_bucket='cvs'
          and d.visibility='private'
          and d.document_type in ('speaking_sample','portfolio','certification')
          and d.verification_status='verified'
      ) into approved_evidence;
    end if;
    if not approved_evidence then
      missing:=missing||jsonb_build_array('speaker_evidence_approval');
    end if;

  elsif cap='facilitator' then
    if coalesce(array_length(p.topics,1),0)=0
       and coalesce(array_length(p.facilitation_topics,1),0)=0 then
      missing:=missing||jsonb_build_array('facilitator_topics');
    end if;
    if coalesce(array_length(p.programme_types,1),0)=0 then
      missing:=missing||jsonb_build_array('facilitator_programme_types');
    end if;

    if capability_row_id is not null then
      select exists(
        select 1
        from public.professional_documents d
        where d.professional_id=p_professional_id
          and d.capability_id=capability_row_id
          and d.storage_bucket='cvs'
          and d.visibility='private'
          and d.document_type in ('facilitation_record','portfolio','certification')
          and d.verification_status='verified'
      ) into approved_evidence;
    end if;
    if not approved_evidence then
      missing:=missing||jsonb_build_array('facilitator_evidence_approval');
    end if;

  else
    missing:=missing||jsonb_build_array('unsupported_capability');
  end if;

  eligible:=jsonb_array_length(missing)=0 and not blocked;

  return jsonb_build_object(
    'professional_id',p_professional_id,
    'capability',cap,
    'eligible',eligible,
    'blocked',blocked,
    'missing',missing
  );
end
$function$;
