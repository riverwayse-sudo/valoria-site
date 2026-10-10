-- Keep internal/test accounts out of every public roster projection without deleting accounts or assessments.
CREATE OR REPLACE FUNCTION private.prevent_test_profiles_from_public_roster()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM public.professional_profiles pp
    WHERE pp.id = NEW.professional_id
      AND pp.is_test IS TRUE
  ) THEN
    RETURN NULL;
  END IF;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION private.prevent_test_profiles_from_public_roster() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS prevent_test_profiles_from_public_roster ON public.marketplace_public_roster;
CREATE TRIGGER prevent_test_profiles_from_public_roster
BEFORE INSERT OR UPDATE ON public.marketplace_public_roster
FOR EACH ROW
EXECUTE FUNCTION private.prevent_test_profiles_from_public_roster();

-- Remove only public projection rows linked to explicitly marked test accounts.
-- Participant accounts, completed assessments, and private records remain untouched.
DELETE FROM public.marketplace_public_roster r
USING public.professional_profiles pp
WHERE pp.id = r.professional_id
  AND pp.is_test IS TRUE;

-- New public projection uses the assessment-derived descriptor, never self-written headline copy.
CREATE OR REPLACE FUNCTION public.get_homepage_professional_previews_v2()
RETURNS TABLE(
  id uuid,
  atb_id text,
  display_initials text,
  headline text,
  assessment_summary text,
  photo_url text,
  active_tracks text[],
  valu_index integer,
  listing_track text
)
LANGUAGE sql
STABLE
SET search_path TO 'public'
AS $function$
  SELECT r.professional_id, r.atb_id, r.display_initials, r.headline,
         r.assessment_summary, r.photo_url, r.capabilities, r.valu_index, r.track
  FROM public.marketplace_public_roster r
  WHERE r.assessment_access = 'full'
    AND r.assessment_summary IS NOT NULL
    AND length(btrim(r.assessment_summary)) >= 12
    AND r.atb_id NOT IN (
      'ATB-C-SAA-00179',
      'ATB-C-OAA-00157',
      'ATB-68A5E7D8',
      'ATB-C-𝙾𝙴𝙾-00387'
    )
  ORDER BY r.valu_index DESC NULLS LAST, r.atb_id
  LIMIT 24;
$function$;

REVOKE EXECUTE ON FUNCTION public.get_homepage_professional_previews_v2() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_homepage_professional_previews_v2() TO anon, authenticated, service_role;

-- Count the same eligible public cohort, independent of the 24-card preview limit.
CREATE OR REPLACE FUNCTION public.get_homepage_professional_count()
RETURNS bigint
LANGUAGE sql
STABLE
SET search_path TO 'public'
AS $function$
  SELECT count(DISTINCT r.professional_id)::bigint
  FROM public.marketplace_public_roster r
  WHERE r.assessment_access = 'full'
    AND r.assessment_summary IS NOT NULL
    AND length(btrim(r.assessment_summary)) >= 12
    AND r.atb_id NOT IN (
      'ATB-C-SAA-00179',
      'ATB-C-OAA-00157',
      'ATB-68A5E7D8',
      'ATB-C-𝙾𝙴𝙾-00387'
    );
$function$;
