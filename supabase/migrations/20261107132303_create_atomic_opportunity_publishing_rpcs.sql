begin;
create or replace function public.create_admin_opportunity(
  p_admin_user_id uuid,
  p_opportunity jsonb,
  p_submission_payload jsonb
)
returns table(opportunity_id uuid, slug text)
language plpgsql
security invoker
set search_path = ''
as $function$
declare
  v_admin_email text;
  v_admin_name text;
  v_title text := pg_catalog.btrim(coalesce(p_opportunity ->> 'title', ''));
  v_organisation text := pg_catalog.btrim(coalesce(p_opportunity ->> 'organisation_name', ''));
  v_description text := pg_catalog.btrim(coalesce(p_opportunity ->> 'description', ''));
  v_slug text;
  v_type text := coalesce(p_opportunity ->> 'opportunity_type', 'job');
  v_work_mode text := nullif(p_opportunity ->> 'work_mode', '');
  v_employment_type text := nullif(p_opportunity ->> 'employment_type', '');
  v_application_url text := nullif(pg_catalog.btrim(coalesce(p_opportunity ->> 'application_url', '')), '');
  v_closing_at timestamptz;
  v_capabilities text[] := array[]::text[];
  v_skills text[] := array[]::text[];
  v_now timestamptz := pg_catalog.now();
  v_opportunity_id uuid;
begin
  if p_admin_user_id is null then
    raise exception 'Valoria administrator access required' using errcode = '42501';
  end if;
  select a.email, a.full_name into v_admin_email, v_admin_name
  from public.admin_users as a where a.id = p_admin_user_id for share;
  if not found then raise exception 'Valoria administrator access required' using errcode = '42501'; end if;

  if pg_catalog.jsonb_typeof(p_opportunity) <> 'object'
    or v_title = '' or pg_catalog.length(v_title) > 180
    or v_organisation = '' or pg_catalog.length(v_organisation) > 180
    or v_description = '' or pg_catalog.length(v_description) > 10000 then
    raise exception 'Job title, organisation and description are required and must be within limits' using errcode = '22023';
  end if;
  if v_type not in ('job','contract','consulting','speaking','facilitation','coaching','project') then raise exception 'Unsupported opportunity type' using errcode = '22023'; end if;
  if v_work_mode is not null and v_work_mode not in ('onsite','hybrid','remote') then raise exception 'Unsupported work mode' using errcode = '22023'; end if;
  if v_employment_type is not null and v_employment_type not in ('full-time','part-time','contract','temporary','internship') then raise exception 'Unsupported employment type' using errcode = '22023'; end if;
  if v_application_url is not null and v_application_url !~* '^https?://' then raise exception 'Application URL must use HTTP or HTTPS' using errcode = '22023'; end if;
  if nullif(p_opportunity ->> 'closing_at', '') is not null then
    v_closing_at := (p_opportunity ->> 'closing_at')::timestamptz;
    if v_closing_at <= v_now then raise exception 'Closing date must be in the future' using errcode = '22023'; end if;
  end if;
  if p_opportunity ? 'capabilities' and pg_catalog.jsonb_typeof(p_opportunity -> 'capabilities') <> 'array' then raise exception 'Capabilities must be an array' using errcode = '22023'; end if;
  if p_opportunity ? 'skills' and pg_catalog.jsonb_typeof(p_opportunity -> 'skills') <> 'array' then raise exception 'Skills must be an array' using errcode = '22023'; end if;

  v_capabilities := array(select pg_catalog.btrim(value) from pg_catalog.jsonb_array_elements_text(coalesce(p_opportunity -> 'capabilities', '[]'::jsonb)) as item(value) where pg_catalog.btrim(value) <> '' limit 20);
  v_skills := array(select pg_catalog.btrim(value) from pg_catalog.jsonb_array_elements_text(coalesce(p_opportunity -> 'skills', '[]'::jsonb)) as item(value) where pg_catalog.btrim(value) <> '' limit 20);
  v_slug := pg_catalog.btrim(pg_catalog.regexp_replace(pg_catalog.lower(v_title), '[^a-z0-9]+', '-', 'g'), '-');
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(v_slug, 0));
  if exists (select 1 from public.opportunities as o where o.slug = v_slug) then
    v_slug := pg_catalog.left(v_slug, 80) || '-' || pg_catalog.substr(pg_catalog.replace(pg_catalog.gen_random_uuid()::text, '-', ''), 1, 8);
  end if;

  insert into public.opportunities (
    slug,title,opportunity_type,summary,description,organisation_name,location,work_mode,
    employment_type,experience_level,industry,capabilities,skills,compensation,
    application_method,application_url,closing_at,status,access_level,created_by,
    reviewed_by,reviewed_at,published_at
  ) values (
    v_slug,v_title,v_type,nullif(pg_catalog.btrim(coalesce(p_opportunity ->> 'summary','')),''),
    v_description,v_organisation,nullif(pg_catalog.btrim(coalesce(p_opportunity ->> 'location','')),''),
    v_work_mode,v_employment_type,nullif(pg_catalog.btrim(coalesce(p_opportunity ->> 'experience_level','')),''),
    nullif(pg_catalog.btrim(coalesce(p_opportunity ->> 'industry','')),''),v_capabilities,v_skills,
    nullif(pg_catalog.btrim(coalesce(p_opportunity ->> 'compensation','')),''),
    case when v_application_url is null then 'valoria' else 'external' end,v_application_url,
    v_closing_at,'published','public',p_admin_user_id,p_admin_user_id,v_now,v_now
  ) returning id into v_opportunity_id;

  insert into public.opportunity_submissions (
    opportunity_id,submitter_user_id,submitter_name,submitter_email,organisation_name,
    payload,status,admin_notes,reviewed_by,reviewed_at
  ) values (
    v_opportunity_id,p_admin_user_id,coalesce(nullif(v_admin_name,''),v_admin_email),v_admin_email,
    v_organisation,coalesce(p_submission_payload,'{}'::jsonb),'approved',
    'Created and published by an authenticated Valoria administrator.',p_admin_user_id,v_now
  );
  return query select v_opportunity_id,v_slug;
end;
$function$;

create or replace function public.create_employer_opportunity_submission(
  p_opportunity jsonb,p_submitter_name text,p_submitter_email text,p_submission_payload jsonb
)
returns table(opportunity_id uuid, slug text)
language plpgsql
security invoker
set search_path = ''
as $function$
declare
  v_submitter_name text := pg_catalog.btrim(coalesce(p_submitter_name,''));
  v_submitter_email text := pg_catalog.lower(pg_catalog.btrim(coalesce(p_submitter_email,'')));
  v_title text := pg_catalog.btrim(coalesce(p_opportunity ->> 'title',''));
  v_organisation text := pg_catalog.btrim(coalesce(p_opportunity ->> 'organisation_name',''));
  v_description text := pg_catalog.btrim(coalesce(p_opportunity ->> 'description',''));
  v_slug text;
  v_type text := coalesce(p_opportunity ->> 'opportunity_type','job');
  v_work_mode text := nullif(p_opportunity ->> 'work_mode','');
  v_employment_type text := nullif(p_opportunity ->> 'employment_type','');
  v_application_url text := nullif(pg_catalog.btrim(coalesce(p_opportunity ->> 'application_url','')),'');
  v_closing_at timestamptz;
  v_capabilities text[] := array[]::text[];
  v_skills text[] := array[]::text[];
  v_opportunity_id uuid;
  v_now timestamptz := pg_catalog.now();
begin
  if pg_catalog.jsonb_typeof(p_opportunity) <> 'object'
    or v_title = '' or pg_catalog.length(v_title) > 180
    or v_organisation = '' or pg_catalog.length(v_organisation) > 180
    or v_description = '' or pg_catalog.length(v_description) > 10000 then
    raise exception 'Job title, organisation and description are required and must be within limits' using errcode = '22023';
  end if;
  if v_submitter_name = '' or pg_catalog.length(v_submitter_name) > 140
    or v_submitter_email = '' or pg_catalog.length(v_submitter_email) > 254
    or v_submitter_email !~ '^[^[:space:]@]+@[^[:space:]@]+\\.[^[:space:]@]+$' then
    raise exception 'A valid submitter name and email are required' using errcode = '22023';
  end if;
  if v_type not in ('job','contract','consulting','speaking','facilitation','coaching','project') then raise exception 'Unsupported opportunity type' using errcode = '22023'; end if;
  if v_work_mode is not null and v_work_mode not in ('onsite','hybrid','remote') then raise exception 'Unsupported work mode' using errcode = '22023'; end if;
  if v_employment_type is not null and v_employment_type not in ('full-time','part-time','contract','temporary','internship') then raise exception 'Unsupported employment type' using errcode = '22023'; end if;
  if v_application_url is not null and v_application_url !~* '^https?://' then raise exception 'Application URL must use HTTP or HTTPS' using errcode = '22023'; end if;
  if nullif(p_opportunity ->> 'closing_at','') is not null then
    v_closing_at := (p_opportunity ->> 'closing_at')::timestamptz;
    if v_closing_at <= v_now then raise exception 'Closing date must be in the future' using errcode = '22023'; end if;
  end if;
  if p_opportunity ? 'capabilities' and pg_catalog.jsonb_typeof(p_opportunity -> 'capabilities') <> 'array' then raise exception 'Capabilities must be an array' using errcode = '22023'; end if;
  if p_opportunity ? 'skills' and pg_catalog.jsonb_typeof(p_opportunity -> 'skills') <> 'array' then raise exception 'Skills must be an array' using errcode = '22023'; end if;

  v_capabilities := array(select pg_catalog.btrim(value) from pg_catalog.jsonb_array_elements_text(coalesce(p_opportunity -> 'capabilities','[]'::jsonb)) as item(value) where pg_catalog.btrim(value) <> '' limit 20);
  v_skills := array(select pg_catalog.btrim(value) from pg_catalog.jsonb_array_elements_text(coalesce(p_opportunity -> 'skills','[]'::jsonb)) as item(value) where pg_catalog.btrim(value) <> '' limit 20);
  v_slug := pg_catalog.btrim(pg_catalog.regexp_replace(pg_catalog.lower(v_title),'[^a-z0-9]+','-','g'),'-');
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(v_slug,0));
  if exists (select 1 from public.opportunities as o where o.slug=v_slug) then
    v_slug := pg_catalog.left(v_slug,80) || '-' || pg_catalog.substr(pg_catalog.replace(pg_catalog.gen_random_uuid()::text,'-',''),1,8);
  end if;

  insert into public.opportunities (
    slug,title,opportunity_type,summary,description,organisation_name,location,work_mode,
    employment_type,experience_level,industry,capabilities,skills,compensation,
    application_method,application_url,closing_at,status,access_level
  ) values (
    v_slug,v_title,v_type,nullif(pg_catalog.btrim(coalesce(p_opportunity ->> 'summary','')),''),
    v_description,v_organisation,nullif(pg_catalog.btrim(coalesce(p_opportunity ->> 'location','')),''),
    v_work_mode,v_employment_type,nullif(pg_catalog.btrim(coalesce(p_opportunity ->> 'experience_level','')),''),
    nullif(pg_catalog.btrim(coalesce(p_opportunity ->> 'industry','')),''),v_capabilities,v_skills,
    nullif(pg_catalog.btrim(coalesce(p_opportunity ->> 'compensation','')),''),
    case when v_application_url is null then 'valoria' else 'external' end,v_application_url,
    v_closing_at,'pending_review','public'
  ) returning id into v_opportunity_id;

  insert into public.opportunity_submissions (
    opportunity_id,submitter_name,submitter_email,organisation_name,payload,status
  ) values (
    v_opportunity_id,v_submitter_name,v_submitter_email,v_organisation,
    coalesce(p_submission_payload,'{}'::jsonb),'pending_review'
  );
  return query select v_opportunity_id,v_slug;
end;
$function$;

revoke all on function public.create_admin_opportunity(uuid,jsonb,jsonb) from public,anon,authenticated;
grant execute on function public.create_admin_opportunity(uuid,jsonb,jsonb) to service_role;
revoke all on function public.create_employer_opportunity_submission(jsonb,text,text,jsonb) from public,anon,authenticated;
grant execute on function public.create_employer_opportunity_submission(jsonb,text,text,jsonb) to service_role;
commit;