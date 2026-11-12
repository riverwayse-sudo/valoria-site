-- Retired marketplace archive is preserved for audit/recovery only.
-- It is not referenced by active application code and must not be exposed via PostgREST.
-- The archive currently contains 220 stale synthetic records; preserve all rows.
DROP POLICY IF EXISTS marketplace_profiles_public_read
  ON public.legacy_marketplace_profiles_archive;

REVOKE ALL PRIVILEGES
  ON TABLE public.legacy_marketplace_profiles_archive
  FROM PUBLIC, anon, authenticated;
