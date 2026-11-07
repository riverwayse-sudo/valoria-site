-- The employer submission API calls this RPC using the service-role key.
-- Keep the write-capable limiter inaccessible to public/client roles and pin
-- the SECURITY DEFINER search path to the system catalog only.

CREATE OR REPLACE FUNCTION public.consume_opportunity_submission_rate_limit(
  p_key_hash text,
  p_limit integer DEFAULT 5,
  p_window_seconds integer DEFAULT 3600
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  v_row public.opportunity_submission_rate_limits%rowtype;
BEGIN
  IF p_key_hash IS NULL OR pg_catalog.length(p_key_hash) < 32
    OR p_limit IS NULL OR p_limit < 1
    OR p_window_seconds IS NULL OR p_window_seconds < 1 THEN
    RETURN false;
  END IF;

  SELECT * INTO v_row
  FROM public.opportunity_submission_rate_limits
  WHERE key_hash = p_key_hash
  FOR UPDATE;

  IF NOT FOUND THEN
    INSERT INTO public.opportunity_submission_rate_limits(key_hash, request_count)
    VALUES (p_key_hash, 1);
    RETURN true;
  END IF;

  IF v_row.window_started_at <= pg_catalog.now() - pg_catalog.make_interval(secs => p_window_seconds) THEN
    UPDATE public.opportunity_submission_rate_limits
    SET window_started_at = pg_catalog.now(), request_count = 1, updated_at = pg_catalog.now()
    WHERE key_hash = p_key_hash;
    RETURN true;
  END IF;

  IF v_row.request_count >= p_limit THEN
    UPDATE public.opportunity_submission_rate_limits
    SET updated_at = pg_catalog.now()
    WHERE key_hash = p_key_hash;
    RETURN false;
  END IF;

  UPDATE public.opportunity_submission_rate_limits
  SET request_count = request_count + 1, updated_at = pg_catalog.now()
  WHERE key_hash = p_key_hash;
  RETURN true;
END;
$function$;

REVOKE ALL ON FUNCTION public.consume_opportunity_submission_rate_limit(text, integer, integer)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_opportunity_submission_rate_limit(text, integer, integer)
  TO service_role;
