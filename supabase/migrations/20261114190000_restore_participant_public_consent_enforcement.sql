-- Restore the participant-entered consent boundary after the production helper
-- was overridden with an unconditional TRUE. Reconcile only public visibility
-- projections; preserve profiles, assessment results, capabilities and acknowledgements.

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

REVOKE ALL ON FUNCTION private.has_public_profile_consent(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION private.has_public_profile_consent(uuid) TO service_role;

-- Keep listing-status reconciliation on the same canonical consent predicate.
-- Abort rather than silently patching a function whose source has drifted.
DO $migration$
DECLARE
  v_definition text;
  v_old text;
  v_new text;
  v_count integer;
BEGIN
  v_definition := pg_get_functiondef('private.sync_professional_listing_status(uuid)'::regprocedure);

  v_old := $old$  select coalesce((
    select acknowledgement.acknowledgement_version = 'public-profile-visibility-v3-2026-11-07'
    from public.professional_profile_acknowledgements acknowledgement
    where acknowledgement.professional_id = p_professional_id
      and acknowledgement.acknowledgement_type = 'profile_submission'
    order by acknowledgement.acknowledged_at desc nulls last,
             acknowledgement.created_at desc,
             acknowledgement.id desc
    limit 1
  ), false) into public_consent_ok;$old$;

  v_new := '  public_consent_ok := private.has_public_profile_consent(p_professional_id);';
  v_count := (length(v_definition) - length(replace(v_definition, v_old, ''))) / length(v_old);

  IF v_count <> 1 THEN
    RAISE EXCEPTION 'Expected one legacy consent block in sync_professional_listing_status; found %', v_count;
  END IF;

  v_definition := replace(v_definition, v_old, v_new);
  EXECUTE v_definition;
END;
$migration$;

-- The public profile and marketplace readers both begin from this canonical
-- projection. Remove rows lacking consent; retain all source profile data.
-- The roster is a projection, not the source of truth. Remove only rows that
-- cannot be supported by current participant-entered public consent.
DELETE FROM public.marketplace_public_roster AS roster
WHERE NOT private.has_public_profile_consent(roster.professional_id);

-- Public profile and directory readers start from this canonical projection.
-- Client roles cannot select the roster table directly.
DO $assert$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM public.marketplace_public_roster AS roster
    WHERE NOT private.has_public_profile_consent(roster.professional_id)
  ) THEN
    RAISE EXCEPTION 'Marketplace roster still contains a profile without participant-entered public consent';
  END IF;

  IF position(
    'private.has_public_profile_consent(p_professional_id)'
    IN pg_get_functiondef('private.sync_professional_listing_status(uuid)'::regprocedure)
  ) = 0 THEN
    RAISE EXCEPTION 'Listing-status reconciliation is not using the canonical consent predicate';
  END IF;

  IF position(
    'private.has_public_profile_consent(p.id)'
    IN pg_get_functiondef('private.get_marketplace_public_roster_v1_impl(uuid,text)'::regprocedure)
  ) = 0 THEN
    RAISE EXCEPTION 'Public marketplace RPC is not revalidating participant consent';
  END IF;

  IF has_table_privilege('anon', 'public.marketplace_public_roster', 'SELECT')
     OR has_table_privilege('authenticated', 'public.marketplace_public_roster', 'SELECT')
     OR has_table_privilege('anon', 'public.professional_profiles', 'SELECT') THEN
    RAISE EXCEPTION 'Public profile source tables must remain inaccessible to direct client SELECT';
  END IF;

  IF has_function_privilege('anon', 'private.has_public_profile_consent(uuid)', 'EXECUTE')
     OR has_function_privilege('authenticated', 'private.has_public_profile_consent(uuid)', 'EXECUTE') THEN
    RAISE EXCEPTION 'Client roles must not execute the private consent helper directly';
  END IF;
END;
$assert$;
