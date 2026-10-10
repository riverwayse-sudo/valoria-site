-- The taster roster refresh is an internal projection-maintenance function.
-- It must never be callable through the public Data API by anon/authenticated.
REVOKE EXECUTE ON FUNCTION public.refresh_taster_marketplace_roster() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.refresh_taster_marketplace_roster() TO service_role;
