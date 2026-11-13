CREATE OR REPLACE FUNCTION private.has_public_profile_consent(p_professional_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'pg_catalog'
AS $function$
  SELECT COALESCE((
    SELECT acknowledgement.acknowledgement_version = 'public-profile-visibility-v3-2026-11-07'
       AND acknowledgement.source IN ('profile_setup', 'profile_edit')
    FROM public.professional_profile_acknowledgements acknowledgement
    WHERE acknowledgement.professional_id = p_professional_id
      AND acknowledgement.acknowledgement_type = 'profile_submission'
    ORDER BY acknowledgement.acknowledged_at DESC NULLS LAST,
             acknowledgement.created_at DESC,
             acknowledgement.id DESC
    LIMIT 1
  ), FALSE);
$function$;

-- Remove only public projection rows without participant-entered consent.
-- Canonical profiles, assessment records, and acknowledgement history remain untouched.
DELETE FROM public.marketplace_public_roster AS roster
WHERE NOT private.has_public_profile_consent(roster.professional_id);
