-- Decouple professional profile discovery from capability-specific evidence approval.
-- A complete, non-test profile with a current VALU Index score >= 35 can be
-- automatically listed in the general marketplace. Capability lanes remain
-- independently gated by verified evidence in sync_professional_capability().
-- Public visibility still requires participant-entered public consent, and
-- suspension/revocation remains authoritative.

DO $migration$
DECLARE
  v_definition text;
  v_old text;
  v_new text;
  v_count integer;
BEGIN
  v_definition := pg_get_functiondef('private.sync_professional_listing_status(uuid)'::regprocedure);

  v_old := 'if (full_listing_ready or basic_profile_ok or basic_taster_ok) and not blocked then';
  v_new := 'if ((assessment_ok and coalesce(p.profile_complete, false)) or basic_profile_ok or basic_taster_ok) and not blocked then';
  v_count := (length(v_definition) - length(replace(v_definition, v_old, ''))) / length(v_old);

  IF v_count <> 1 THEN
    RAISE EXCEPTION 'Expected exactly one profile-level listing gate; found %', v_count;
  END IF;

  v_definition := replace(v_definition, v_old, v_new);
  EXECUTE v_definition;
END;
$migration$;

-- Reconcile existing non-test profiles through the same canonical lifecycle
-- function. This is idempotent and preserves consent, capability evidence,
-- profile data, assessments, and administrator revocation/suspension controls.
DO $reconcile$
DECLARE
  v_professional_id uuid;
BEGIN
  FOR v_professional_id IN
    SELECT id
    FROM public.professional_profiles
    WHERE coalesce(is_test, false) = false
    ORDER BY created_at, id
  LOOP
    PERFORM private.sync_professional_listing_status(v_professional_id);
  END LOOP;
END;
$reconcile$;

DO $assert$
BEGIN
  IF position(
    'assessment_ok and coalesce(p.profile_complete, false)'
    IN pg_get_functiondef('private.sync_professional_listing_status(uuid)'::regprocedure)
  ) = 0 THEN
    RAISE EXCEPTION 'Automatic full-profile listing gate was not installed';
  END IF;

  IF position(
    'and not blocked then'
    IN pg_get_functiondef('private.sync_professional_listing_status(uuid)'::regprocedure)
  ) = 0 THEN
    RAISE EXCEPTION 'Administrator suspension/revocation guard is missing';
  END IF;
END;
$assert$;
