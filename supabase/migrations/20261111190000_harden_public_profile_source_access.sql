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
