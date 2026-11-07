-- A submission key identifies one exact request. Reusing it with changed
-- content must fail rather than return a success for data that was not saved.

CREATE OR REPLACE FUNCTION public.create_admin_opportunity(
  p_submission_key uuid,
  p_admin_user_id uuid,
  p_opportunity jsonb,
  p_submission_payload jsonb
)
RETURNS TABLE(opportunity_id uuid, slug text, created boolean)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $function$
DECLARE
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
  v_existing_id uuid;
  v_existing_slug text;
  v_existing_user_id uuid;
  v_existing_payload jsonb;
BEGIN
  IF p_submission_key IS NULL THEN
    RAISE EXCEPTION 'A submission reference is required' USING ERRCODE = '22023';
  END IF;
  IF p_admin_user_id IS NULL THEN
    RAISE EXCEPTION 'Valoria administrator access required' USING ERRCODE = '42501';
  END IF;

  SELECT a.email, a.full_name INTO v_admin_email, v_admin_name
  FROM public.admin_users AS a
  WHERE a.id = p_admin_user_id
  FOR SHARE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Valoria administrator access required' USING ERRCODE = '42501';
  END IF;

  PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_submission_key::text, 1));
  SELECT s.opportunity_id, o.slug, s.submitter_user_id, s.payload
    INTO v_existing_id, v_existing_slug, v_existing_user_id, v_existing_payload
  FROM public.opportunity_submissions AS s
  JOIN public.opportunities AS o ON o.id = s.opportunity_id
  WHERE s.submission_key = p_submission_key
  FOR UPDATE OF s;

  IF FOUND THEN
    IF v_existing_user_id IS DISTINCT FROM p_admin_user_id
      OR v_existing_payload IS DISTINCT FROM coalesce(p_submission_payload, '{}'::jsonb) THEN
      RAISE EXCEPTION 'Submission reference was reused with different job details' USING ERRCODE = '22023';
    END IF;
    RETURN QUERY SELECT v_existing_id, v_existing_slug, false;
    RETURN;
  END IF;

  IF pg_catalog.jsonb_typeof(p_opportunity) <> 'object'
    OR v_title = '' OR pg_catalog.length(v_title) > 180
    OR v_organisation = '' OR pg_catalog.length(v_organisation) > 180
    OR v_description = '' OR pg_catalog.length(v_description) > 10000 THEN
    RAISE EXCEPTION 'Job title, organisation and description are required and must be within limits' USING ERRCODE = '22023';
  END IF;
  IF v_type NOT IN ('job','contract','consulting','speaking','facilitation','coaching','project') THEN
    RAISE EXCEPTION 'Unsupported opportunity type' USING ERRCODE = '22023';
  END IF;
  IF v_work_mode IS NOT NULL AND v_work_mode NOT IN ('onsite','hybrid','remote') THEN
    RAISE EXCEPTION 'Unsupported work mode' USING ERRCODE = '22023';
  END IF;
  IF v_employment_type IS NOT NULL AND v_employment_type NOT IN ('full-time','part-time','contract','temporary','internship') THEN
    RAISE EXCEPTION 'Unsupported employment type' USING ERRCODE = '22023';
  END IF;
  IF v_application_url IS NOT NULL AND v_application_url !~* '^https?://' THEN
    RAISE EXCEPTION 'Application URL must use HTTP or HTTPS' USING ERRCODE = '22023';
  END IF;
  IF nullif(p_opportunity ->> 'closing_at', '') IS NOT NULL THEN
    v_closing_at := (p_opportunity ->> 'closing_at')::timestamptz;
    IF v_closing_at <= v_now THEN
      RAISE EXCEPTION 'Closing date must be in the future' USING ERRCODE = '22023';
    END IF;
  END IF;
  IF p_opportunity ? 'capabilities' AND pg_catalog.jsonb_typeof(p_opportunity -> 'capabilities') <> 'array' THEN
    RAISE EXCEPTION 'Capabilities must be an array' USING ERRCODE = '22023';
  END IF;
  IF p_opportunity ? 'skills' AND pg_catalog.jsonb_typeof(p_opportunity -> 'skills') <> 'array' THEN
    RAISE EXCEPTION 'Skills must be an array' USING ERRCODE = '22023';
  END IF;

  v_capabilities := array(
    SELECT pg_catalog.btrim(value)
    FROM pg_catalog.jsonb_array_elements_text(coalesce(p_opportunity -> 'capabilities', '[]'::jsonb)) AS item(value)
    WHERE pg_catalog.btrim(value) <> ''
    LIMIT 20
  );
  v_skills := array(
    SELECT pg_catalog.btrim(value)
    FROM pg_catalog.jsonb_array_elements_text(coalesce(p_opportunity -> 'skills', '[]'::jsonb)) AS item(value)
    WHERE pg_catalog.btrim(value) <> ''
    LIMIT 20
  );

  v_slug := pg_catalog.btrim(pg_catalog.regexp_replace(pg_catalog.lower(v_title), '[^a-z0-9]+', '-', 'g'), '-');
  IF v_slug = '' THEN
    v_slug := 'opportunity-' || pg_catalog.substr(pg_catalog.replace(pg_catalog.gen_random_uuid()::text, '-', ''), 1, 8);
  END IF;
  PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(v_slug, 0));
  IF EXISTS (SELECT 1 FROM public.opportunities AS o WHERE o.slug = v_slug) THEN
    v_slug := pg_catalog.left(v_slug, 80) || '-' || pg_catalog.substr(pg_catalog.replace(pg_catalog.gen_random_uuid()::text, '-', ''), 1, 8);
  END IF;

  INSERT INTO public.opportunities (
    slug, title, opportunity_type, summary, description, organisation_name,
    location, work_mode, employment_type, experience_level, industry,
    capabilities, skills, compensation, application_method, application_url,
    closing_at, status, access_level, created_by, reviewed_by, reviewed_at, published_at
  ) VALUES (
    v_slug, v_title, v_type,
    nullif(pg_catalog.btrim(coalesce(p_opportunity ->> 'summary', '')), ''),
    v_description, v_organisation,
    nullif(pg_catalog.btrim(coalesce(p_opportunity ->> 'location', '')), ''),
    v_work_mode, v_employment_type,
    nullif(pg_catalog.btrim(coalesce(p_opportunity ->> 'experience_level', '')), ''),
    nullif(pg_catalog.btrim(coalesce(p_opportunity ->> 'industry', '')), ''),
    v_capabilities, v_skills,
    nullif(pg_catalog.btrim(coalesce(p_opportunity ->> 'compensation', '')), ''),
    CASE WHEN v_application_url IS NULL THEN 'valoria' ELSE 'external' END,
    v_application_url, v_closing_at, 'published', 'public',
    p_admin_user_id, p_admin_user_id, v_now, v_now
  )
  RETURNING id INTO v_opportunity_id;

  INSERT INTO public.opportunity_submissions (
    opportunity_id, submission_key, submitter_user_id, submitter_name, submitter_email,
    organisation_name, payload, status, admin_notes, reviewed_by, reviewed_at
  ) VALUES (
    v_opportunity_id, p_submission_key, p_admin_user_id,
    coalesce(nullif(v_admin_name, ''), v_admin_email), v_admin_email,
    v_organisation, coalesce(p_submission_payload, '{}'::jsonb), 'approved',
    'Created and published by an authenticated Valoria administrator.',
    p_admin_user_id, v_now
  );

  RETURN QUERY SELECT v_opportunity_id, v_slug, true;
END;
$function$;

CREATE OR REPLACE FUNCTION public.create_employer_opportunity_submission(
  p_submission_key uuid,
  p_opportunity jsonb,
  p_submitter_name text,
  p_submitter_email text,
  p_submission_payload jsonb
)
RETURNS TABLE(opportunity_id uuid, slug text, created boolean)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $function$
DECLARE
  v_submitter_name text := pg_catalog.btrim(coalesce(p_submitter_name, ''));
  v_submitter_email text := pg_catalog.lower(pg_catalog.btrim(coalesce(p_submitter_email, '')));
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
  v_existing_id uuid;
  v_existing_slug text;
  v_existing_name text;
  v_existing_email text;
  v_existing_payload jsonb;
BEGIN
  IF p_submission_key IS NULL THEN
    RAISE EXCEPTION 'A submission reference is required' USING ERRCODE = '22023';
  END IF;

  PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_submission_key::text, 1));
  SELECT s.opportunity_id, o.slug, s.submitter_name, s.submitter_email, s.payload
    INTO v_existing_id, v_existing_slug, v_existing_name, v_existing_email, v_existing_payload
  FROM public.opportunity_submissions AS s
  JOIN public.opportunities AS o ON o.id = s.opportunity_id
  WHERE s.submission_key = p_submission_key
  FOR UPDATE OF s;

  IF FOUND THEN
    IF pg_catalog.lower(coalesce(v_existing_email, '')) IS DISTINCT FROM v_submitter_email
      OR v_existing_name IS DISTINCT FROM v_submitter_name
      OR v_existing_payload IS DISTINCT FROM coalesce(p_submission_payload, '{}'::jsonb) THEN
      RAISE EXCEPTION 'Submission reference was reused with different opportunity or contact details' USING ERRCODE = '22023';
    END IF;
    RETURN QUERY SELECT v_existing_id, v_existing_slug, false;
    RETURN;
  END IF;

  IF pg_catalog.jsonb_typeof(p_opportunity) <> 'object'
    OR v_title = '' OR pg_catalog.length(v_title) > 180
    OR v_organisation = '' OR pg_catalog.length(v_organisation) > 180
    OR v_description = '' OR pg_catalog.length(v_description) > 10000 THEN
    RAISE EXCEPTION 'Job title, organisation and description are required and must be within limits' USING ERRCODE = '22023';
  END IF;
  IF v_submitter_name = '' OR pg_catalog.length(v_submitter_name) > 140
    OR v_submitter_email = '' OR pg_catalog.length(v_submitter_email) > 254
    OR v_submitter_email !~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$' THEN
    RAISE EXCEPTION 'A valid submitter name and email are required' USING ERRCODE = '22023';
  END IF;
  IF v_type NOT IN ('job','contract','consulting','speaking','facilitation','coaching','project') THEN
    RAISE EXCEPTION 'Unsupported opportunity type' USING ERRCODE = '22023';
  END IF;
  IF v_work_mode IS NOT NULL AND v_work_mode NOT IN ('onsite','hybrid','remote') THEN
    RAISE EXCEPTION 'Unsupported work mode' USING ERRCODE = '22023';
  END IF;
  IF v_employment_type IS NOT NULL AND v_employment_type NOT IN ('full-time','part-time','contract','temporary','internship') THEN
    RAISE EXCEPTION 'Unsupported employment type' USING ERRCODE = '22023';
  END IF;
  IF v_application_url IS NOT NULL AND v_application_url !~* '^https?://' THEN
    RAISE EXCEPTION 'Application URL must use HTTP or HTTPS' USING ERRCODE = '22023';
  END IF;
  IF nullif(p_opportunity ->> 'closing_at', '') IS NOT NULL THEN
    v_closing_at := (p_opportunity ->> 'closing_at')::timestamptz;
    IF v_closing_at <= v_now THEN
      RAISE EXCEPTION 'Closing date must be in the future' USING ERRCODE = '22023';
    END IF;
  END IF;
  IF p_opportunity ? 'capabilities' AND pg_catalog.jsonb_typeof(p_opportunity -> 'capabilities') <> 'array' THEN
    RAISE EXCEPTION 'Capabilities must be an array' USING ERRCODE = '22023';
  END IF;
  IF p_opportunity ? 'skills' AND pg_catalog.jsonb_typeof(p_opportunity -> 'skills') <> 'array' THEN
    RAISE EXCEPTION 'Skills must be an array' USING ERRCODE = '22023';
  END IF;

  v_capabilities := array(
    SELECT pg_catalog.btrim(value)
    FROM pg_catalog.jsonb_array_elements_text(coalesce(p_opportunity -> 'capabilities', '[]'::jsonb)) AS item(value)
    WHERE pg_catalog.btrim(value) <> ''
    LIMIT 20
  );
  v_skills := array(
    SELECT pg_catalog.btrim(value)
    FROM pg_catalog.jsonb_array_elements_text(coalesce(p_opportunity -> 'skills', '[]'::jsonb)) AS item(value)
    WHERE pg_catalog.btrim(value) <> ''
    LIMIT 20
  );

  v_slug := pg_catalog.btrim(pg_catalog.regexp_replace(pg_catalog.lower(v_title), '[^a-z0-9]+', '-', 'g'), '-');
  IF v_slug = '' THEN
    v_slug := 'opportunity-' || pg_catalog.substr(pg_catalog.replace(pg_catalog.gen_random_uuid()::text, '-', ''), 1, 8);
  END IF;
  PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(v_slug, 0));
  IF EXISTS (SELECT 1 FROM public.opportunities AS o WHERE o.slug = v_slug) THEN
    v_slug := pg_catalog.left(v_slug, 80) || '-' || pg_catalog.substr(pg_catalog.replace(pg_catalog.gen_random_uuid()::text, '-', ''), 1, 8);
  END IF;

  INSERT INTO public.opportunities (
    slug, title, opportunity_type, summary, description, organisation_name,
    location, work_mode, employment_type, experience_level, industry,
    capabilities, skills, compensation, application_method, application_url,
    closing_at, status, access_level
  ) VALUES (
    v_slug, v_title, v_type,
    nullif(pg_catalog.btrim(coalesce(p_opportunity ->> 'summary', '')), ''),
    v_description, v_organisation,
    nullif(pg_catalog.btrim(coalesce(p_opportunity ->> 'location', '')), ''),
    v_work_mode, v_employment_type,
    nullif(pg_catalog.btrim(coalesce(p_opportunity ->> 'experience_level', '')), ''),
    nullif(pg_catalog.btrim(coalesce(p_opportunity ->> 'industry', '')), ''),
    v_capabilities, v_skills,
    nullif(pg_catalog.btrim(coalesce(p_opportunity ->> 'compensation', '')), ''),
    CASE WHEN v_application_url IS NULL THEN 'valoria' ELSE 'external' END,
    v_application_url, v_closing_at, 'pending_review', 'public'
  )
  RETURNING id INTO v_opportunity_id;

  INSERT INTO public.opportunity_submissions (
    opportunity_id, submission_key, submitter_name, submitter_email,
    organisation_name, payload, status
  ) VALUES (
    v_opportunity_id, p_submission_key, v_submitter_name, v_submitter_email,
    v_organisation, coalesce(p_submission_payload, '{}'::jsonb), 'pending_review'
  );

  RETURN QUERY SELECT v_opportunity_id, v_slug, true;
END;
$function$;

REVOKE ALL ON FUNCTION public.create_admin_opportunity(uuid, uuid, jsonb, jsonb)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_admin_opportunity(uuid, uuid, jsonb, jsonb)
  TO service_role;
REVOKE ALL ON FUNCTION public.create_employer_opportunity_submission(uuid, jsonb, text, text, jsonb)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_employer_opportunity_submission(uuid, jsonb, text, text, jsonb)
  TO service_role;
