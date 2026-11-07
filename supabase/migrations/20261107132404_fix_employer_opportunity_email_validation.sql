begin;
create or replace function public.create_employer_opportunity_submission(
  p_submission_key uuid,p_opportunity jsonb,p_submitter_name text,p_submitter_email text,p_submission_payload jsonb
)
returns table(opportunity_id uuid,slug text,created boolean)
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
  v_slug text; v_type text := coalesce(p_opportunity ->> 'opportunity_type','job');
  v_work_mode text := nullif(p_opportunity ->> 'work_mode','');
  v_employment_type text := nullif(p_opportunity ->> 'employment_type','');
  v_application_url text := nullif(pg_catalog.btrim(coalesce(p_opportunity ->> 'application_url','')),'');
  v_closing_at timestamptz; v_capabilities text[] := array[]::text[]; v_skills text[] := array[]::text[];
  v_now timestamptz := pg_catalog.now(); v_opportunity_id uuid;
  v_existing_id uuid; v_existing_slug text; v_existing_name text; v_existing_email text; v_existing_payload jsonb;
begin
  if p_submission_key is null then raise exception 'A submission reference is required' using errcode = '22023'; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_submission_key::text,1));
  select s.opportunity_id,o.slug,s.submitter_name,s.submitter_email,s.payload into v_existing_id,v_existing_slug,v_existing_name,v_existing_email,v_existing_payload
  from public.opportunity_submissions as s join public.opportunities as o on o.id=s.opportunity_id
  where s.submission_key=p_submission_key for update of s;
  if found then
    if pg_catalog.lower(coalesce(v_existing_email,'')) is distinct from v_submitter_email
      or v_existing_name is distinct from v_submitter_name
      or v_existing_payload ->> 'title' is distinct from v_title
      or v_existing_payload ->> 'organisation_name' is distinct from v_organisation then
      raise exception 'Submission reference was reused with different opportunity or contact details' using errcode = '22023';
    end if;
    return query select v_existing_id,v_existing_slug,false;
    return;
  end if;

  if pg_catalog.jsonb_typeof(p_opportunity) <> 'object'
    or v_title='' or pg_catalog.length(v_title)>180
    or v_organisation='' or pg_catalog.length(v_organisation)>180
    or v_description='' or pg_catalog.length(v_description)>10000 then
    raise exception 'Job title, organisation and description are required and must be within limits' using errcode = '22023';
  end if;
  if v_submitter_name='' or pg_catalog.length(v_submitter_name)>140
    or v_submitter_email='' or pg_catalog.length(v_submitter_email)>254
    or v_submitter_email !~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$' then
    raise exception 'A valid submitter name and email are required' using errcode = '22023';
  end if;
  if v_type not in ('job','contract','consulting','speaking','facilitation','coaching','project') then raise exception 'Unsupported opportunity type' using errcode = '22023'; end if;
  if v_work_mode is not null and v_work_mode not in ('onsite','hybrid','remote') then raise exception 'Unsupported work mode' using errcode = '22023'; end if;
  if v_employment_type is not null and v_employment_type not in ('full-time','part-time','contract','temporary','internship') then raise exception 'Unsupported employment type' using errcode = '22023'; end if;
  if v_application_url is not null and v_application_url !~* '^https?://' then raise exception 'Application URL must use HTTP or HTTPS' using errcode = '22023'; end if;
  if nullif(p_opportunity ->> 'closing_at','') is not null then
    v_closing_at := (p_opportunity ->> 'closing_at')::timestamptz;
    if v_closing_at<=v_now then raise exception 'Closing date must be in the future' using errcode = '22023'; end if;
  end if;
  if p_opportunity ? 'capabilities' and pg_catalog.jsonb_typeof(p_opportunity -> 'capabilities') <> 'array' then raise exception 'Capabilities must be an array' using errcode = '22023'; end if;
  if p_opportunity ? 'skills' and pg_catalog.jsonb_typeof(p_opportunity -> 'skills') <> 'array' then raise exception 'Skills must be an array' using errcode = '22023'; end if;
  v_capabilities := array(select pg_catalog.btrim(value) from pg_catalog.jsonb_array_elements_text(coalesce(p_opportunity -> 'capabilities','[]'::jsonb)) as item(value) where pg_catalog.btrim(value)<>'' limit 20);
  v_skills := array(select pg_catalog.btrim(value) from pg_catalog.jsonb_array_elements_text(coalesce(p_opportunity -> 'skills','[]'::jsonb)) as item(value) where pg_catalog.btrim(value)<>'' limit 20);

  v_slug := pg_catalog.btrim(pg_catalog.regexp_replace(pg_catalog.lower(v_title),'[^a-z0-9]+','-','g'),'-');
  if v_slug='' then v_slug:='opportunity-'||pg_catalog.substr(pg_catalog.replace(pg_catalog.gen_random_uuid()::text,'-',''),1,8); end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(v_slug,0));
  if exists(select 1 from public.opportunities as o where o.slug=v_slug) then
    v_slug:=pg_catalog.left(v_slug,80)||'-'||pg_catalog.substr(pg_catalog.replace(pg_catalog.gen_random_uuid()::text,'-',''),1,8);
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
    opportunity_id,submission_key,submitter_name,submitter_email,organisation_name,payload,status
  ) values (
    v_opportunity_id,p_submission_key,v_submitter_name,v_submitter_email,v_organisation,
    coalesce(p_submission_payload,'{}'::jsonb),'pending_review'
  );
  return query select v_opportunity_id,v_slug,true;
end;
$function$;
revoke all on function public.create_employer_opportunity_submission(uuid,jsonb,text,text,jsonb) from public,anon,authenticated;
grant execute on function public.create_employer_opportunity_submission(uuid,jsonb,text,text,jsonb) to service_role;
commit;