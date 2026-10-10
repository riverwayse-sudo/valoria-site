CREATE OR REPLACE FUNCTION public.get_homepage_professional_previews()
RETURNS TABLE(id uuid, atb_id text, display_initials text, headline text, photo_url text, active_tracks text[], valu_index integer, listing_track text)
LANGUAGE sql
STABLE
SET search_path TO 'public'
AS $function$
  SELECT r.professional_id, r.atb_id, r.display_initials, r.assessment_summary,
         r.photo_url, r.capabilities, r.valu_index, r.track
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
GRANT EXECUTE ON FUNCTION public.get_homepage_professional_previews() TO anon, authenticated, service_role;