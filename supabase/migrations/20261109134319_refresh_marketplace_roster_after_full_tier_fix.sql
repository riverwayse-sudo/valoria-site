DO $$
DECLARE
  v_professional_id uuid;
BEGIN
  FOR v_professional_id IN
    SELECT DISTINCT professional_id
    FROM public.marketplace_public_roster
    WHERE professional_id IS NOT NULL
  LOOP
    PERFORM public.refresh_marketplace_public_roster(v_professional_id);
  END LOOP;
END;
$$;
