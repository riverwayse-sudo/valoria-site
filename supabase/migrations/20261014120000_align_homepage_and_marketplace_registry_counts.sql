-- Keep the homepage registry and marketplace directory on the same canonical public roster.
-- The homepage is a live preview of marketplace listings, so it must not apply a
-- separate assessment-summary or hard-coded profile exclusion filter.
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
  SELECT
    r.professional_id,
    r.atb_id,
    r.display_initials,
    r.headline,
    r.assessment_summary,
    r.photo_url,
    r.capabilities,
    r.valu_index,
    r.track
  FROM public.marketplace_public_roster r
  ORDER BY r.valu_index DESC NULLS LAST, r.atb_id
  LIMIT 24;
$function$;

REVOKE EXECUTE ON FUNCTION public.get_homepage_professional_previews_v2() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_homepage_professional_previews_v2() TO anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.get_homepage_professional_count()
RETURNS bigint
LANGUAGE sql
STABLE
SET search_path TO 'public'
AS $function$
  SELECT count(DISTINCT r.professional_id)::bigint
  FROM public.marketplace_public_roster r;
$function$;

REVOKE EXECUTE ON FUNCTION public.get_homepage_professional_count() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_homepage_professional_count() TO anon, authenticated, service_role;
