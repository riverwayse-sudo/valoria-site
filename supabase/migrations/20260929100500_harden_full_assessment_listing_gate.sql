-- Close the remaining eligibility drift: full VALU assessment + capability-specific gates.
-- Taster completion may support journey progress, but it must not make a professional
-- eligible_for_listing. The marketplace gate requires a current full VALU score >= 35
-- and at least one capability-specific eligibility gate to pass.

create or replace function private.valu_assessment_is_current(p_professional_id uuid)
returns boolean
language sql stable security definer
set search_path = public, private
as $$
  select exists (
    select 1 from public.valu_assessments v
    where v.user_id = p_professional_id
      and v.completed_at is not null
      and coalesce(v.total_score,0) >= 35
      and (v.expires_at is null or v.expires_at > now())
  );
$$;
revoke all on function private.valu_assessment_is_current(uuid) from public, anon, authenticated;
grant execute on function private.valu_assessment_is_current(uuid) to service_role;

create or replace function private.evaluate_professional_readiness(p_professional_id uuid)
returns jsonb language plpgsql security definer set search_path = public, private
as $$
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
    return jsonb_build_object(
      'professional_id',p_professional_id,
      'profile_complete',false,
      'full_assessment_complete',false,
      'full_assessment_required_for_general_listing',true,
      'blocked',false,
      'eligible',false,
      'missing',jsonb_build_array('profile')
    );
  end if;

  profile_ok := coalesce(p.profile_complete,false)
    and nullif(trim(coalesce(p.display_name,'')),'') is not null
    and nullif(trim(coalesce(p.headline,'')),'') is not null
    and nullif(trim(coalesce(p.bio,'')),'') is not null
    and nullif(trim(coalesce(p.photo_url,'')),'') is not null
    and cardinality(coalesce(p.active_tracks,'{}'::text[])) > 0
    and nullif(trim(coalesce(p.industry,'')),'') is not null
    and nullif(trim(coalesce(p.username,'')),'') is not null
    and nullif(trim(coalesce(p.phone,'')),'') is not null
    and nullif(trim(coalesce(p.current_job_title,'')),'') is not null
    and nullif(trim(coalesce(p.location,'')),'') is not null
    and coalesce(array_length(p.languages,1),0) > 0
    and nullif(trim(coalesce(p.cv_url,'')),'') is not null;

  valu_ok := private.valu_assessment_is_current(p_professional_id);

  select exists(
    select 1
    from public.professional_listing_events e
    where e.professional_id=p_professional_id
      and e.event_type in ('ADMIN_REVOKED','ADMIN_SUSPENDED')
      and e.created_at=(
        select max(e2.created_at)
        from public.professional_listing_events e2
        where e2.professional_id=p_professional_id
      )
  ) into blocked;

  if not profile_ok then missing:=missing||jsonb_build_array('profile'); end if;
  if not valu_ok then missing:=missing||jsonb_build_array('full_valu_assessment_score_35_current'); end if;
  if cardinality(coalesce(p.active_tracks,'{}'::text[]))=0 then missing:=missing||jsonb_build_array('track'); end if;
  if nullif(trim(coalesce(p.photo_url,'')),'') is null then missing:=missing||jsonb_build_array('photo_url'); end if;
  if nullif(trim(coalesce(p.cv_url,'')),'') is null then missing:=missing||jsonb_build_array('cv_url'); end if;

  eligible:=jsonb_array_length(missing)=0 and not blocked;

  return jsonb_build_object(
    'professional_id',p_professional_id,
    'profile_complete',profile_ok,
    'full_assessment_complete',valu_ok,
    'full_assessment_required_for_general_listing',true,
    'blocked',blocked,
    'eligible',eligible,
    'missing',missing
  );
end;
$$;
revoke all on function private.evaluate_professional_readiness(uuid) from public, anon, authenticated;
grant execute on function private.evaluate_professional_readiness(uuid) to service_role;

create or replace function private.sync_professional_listing_status(p_professional_id uuid)
returns jsonb language plpgsql security definer set search_path = public, private
as $$
declare
  p record;
  cap record;
  readiness jsonb;
  any_eligible boolean := false;
  next_status text;
begin
  select * into p from public.professional_profiles where id=p_professional_id for update;
  if not found then
    return jsonb_build_object('ok',false,'professional_id',p_professional_id);
  end if;

  for cap in
    select capability
    from public.professional_capabilities
    where professional_id=p_professional_id and is_active=true
    order by capability
  loop
    perform private.sync_professional_capability(p_professional_id,cap.capability);
  end loop;

  readiness:=private.evaluate_professional_readiness(p_professional_id);

  select exists(
    select 1
    from public.professional_capabilities
    where professional_id=p_professional_id
      and is_active=true
      and eligible_for_listing=true
      and eligibility_status='listed'
  ) into any_eligible;

  if coalesce((readiness->>'eligible')::boolean,false) and any_eligible then
    next_status:='listed';
  elsif p.listing_status in ('listed','pending') then
    next_status:='unlisted';
  else
    next_status:=p.listing_status;
  end if;

  update public.professional_profiles
  set eligible_for_listing=(next_status='listed'),
      listing_status=next_status,
      visibility=case
        when next_status='listed' then 'public'
        when visibility='public' then 'registered_only'
        else visibility
      end,
      listed_at=case
        when next_status='listed' and listed_at is null then now()
        when next_status<>'listed' then null
        else listed_at
      end,
      updated_at=now()
  where id=p_professional_id;

  return jsonb_build_object(
    'ok',true,
    'eligible_for_listing',(next_status='listed'),
    'listing_status',next_status,
    'readiness',readiness
  );
end;
$$;
revoke all on function private.sync_professional_listing_status(uuid) from public, anon, authenticated;
grant execute on function private.sync_professional_listing_status(uuid) to service_role;
