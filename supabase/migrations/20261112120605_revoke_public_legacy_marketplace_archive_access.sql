-- Retired archive is preserved for audit/recovery only; never expose it to clients.
DROP POLICY IF EXISTS marketplace_profiles_public_read ON public.legacy_marketplace_profiles_archive;
REVOKE ALL PRIVILEGES ON TABLE public.legacy_marketplace_profiles_archive FROM PUBLIC, anon, authenticated;
