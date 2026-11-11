-- Public profile information is served through the server-only, consent-verified
-- projection. Browser roles must not query source tables containing private
-- participant identity, contact, assessment, or evidence fields directly.

-- Legacy buyer/professional profile rows are not a public directory.
REVOKE SELECT ON TABLE public.profiles FROM anon;
DROP POLICY IF EXISTS profiles_public_read_visible ON public.profiles;
DROP POLICY IF EXISTS profiles_owner_or_admin_read ON public.profiles;
CREATE POLICY profiles_owner_or_admin_read
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = id OR is_valoria_admin());

-- The public profile page and Registry use server-only projections. Authenticated
-- access to the source profile remains limited to its owner and Valoria admins.
REVOKE SELECT ON TABLE public.professional_profiles FROM anon;
DROP POLICY IF EXISTS pp_public_read_listed ON public.professional_profiles;
DROP POLICY IF EXISTS pp_public_read_consent_verified ON public.professional_profiles;

-- Public capability and roster data is returned by the server-side Registry
-- projection, which removes internal readiness and participant identity fields.
REVOKE SELECT ON TABLE public.marketplace_public_roster FROM anon, authenticated;
DROP POLICY IF EXISTS marketplace_public_read ON public.marketplace_public_roster;

REVOKE SELECT ON TABLE public.professional_capabilities FROM anon;
DROP POLICY IF EXISTS professional_capabilities_public_listed_read ON public.professional_capabilities;
DROP POLICY IF EXISTS professional_capabilities_owner_select ON public.professional_capabilities;
CREATE POLICY professional_capabilities_owner_select
  ON public.professional_capabilities
  FOR SELECT
  TO authenticated
  USING (professional_id = (SELECT auth.uid()) OR is_valoria_admin());

-- Certificates remain private to their holder and Valoria administrators until
-- an explicitly verified public certificate projection is implemented.
REVOKE SELECT ON TABLE public.professional_certificates FROM anon;
DROP POLICY IF EXISTS certificates_public_verified_read ON public.professional_certificates;

-- Assessment and account source tables are never anonymously readable.
REVOKE SELECT ON TABLE public.valu_assessments FROM anon;
REVOKE SELECT ON TABLE public.users FROM anon;

-- Keep only the authenticated owner/admin reads and writes required by the
-- application. RLS remains the row-level authorization boundary.
GRANT SELECT, UPDATE ON TABLE public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.professional_profiles TO authenticated;
GRANT SELECT ON TABLE public.professional_capabilities TO authenticated;
GRANT SELECT ON TABLE public.valu_assessments TO authenticated;
GRANT SELECT ON TABLE public.professional_certificates TO authenticated;
GRANT SELECT ON TABLE public.users TO authenticated;
GRANT SELECT ON TABLE public.profile_views TO authenticated;
GRANT INSERT ON TABLE public.profile_views TO anon, authenticated;
GRANT SELECT, UPDATE ON TABLE public.enquiries TO authenticated;
GRANT INSERT ON TABLE public.enquiries TO anon, authenticated;

-- These legacy RPCs are not used by the current website. Public Registry
-- reads now use the server-only consent-verified projection.
REVOKE EXECUTE ON FUNCTION public.get_homepage_professional_count() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_homepage_professional_previews_v2() FROM PUBLIC, anon, authenticated;
DO $
BEGIN
  IF to_regprocedure('public.set_marketplace_public_listing_consent(boolean)') IS NOT NULL THEN
    EXECUTE 'REVOKE EXECUTE ON FUNCTION public.set_marketplace_public_listing_consent(boolean) FROM PUBLIC, anon, authenticated';
    EXECUTE 'GRANT EXECUTE ON FUNCTION public.set_marketplace_public_listing_consent(boolean) TO service_role';
  END IF;
END
$;
GRANT EXECUTE ON FUNCTION public.get_homepage_professional_count() TO service_role;
GRANT EXECUTE ON FUNCTION public.get_homepage_professional_previews_v2() TO service_role;

