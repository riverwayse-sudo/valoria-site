-- Repair marketplace projection refresh for capability and listing-governance changes.
-- The triggers already exist on these tables, but the old handler returned early
-- unless the source table was professional_profiles or valu_assessments.
CREATE OR REPLACE FUNCTION public.refresh_marketplace_public_roster_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_professional_id uuid;
BEGIN
  CASE TG_TABLE_NAME
    WHEN 'professional_profiles' THEN
      v_professional_id := coalesce(NEW.id, OLD.id);
    WHEN 'valu_assessments' THEN
      v_professional_id := coalesce(NEW.user_id, OLD.user_id);
    WHEN 'professional_capabilities' THEN
      v_professional_id := coalesce(NEW.professional_id, OLD.professional_id);
    WHEN 'professional_listing_events' THEN
      v_professional_id := coalesce(NEW.professional_id, OLD.professional_id);
    ELSE
      RETURN coalesce(NEW, OLD);
  END CASE;

  IF v_professional_id IS NOT NULL THEN
    PERFORM public.refresh_marketplace_public_roster(v_professional_id);
  END IF;

  RETURN coalesce(NEW, OLD);
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.refresh_marketplace_public_roster_trigger() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.refresh_marketplace_public_roster_trigger() TO postgres, service_role;
