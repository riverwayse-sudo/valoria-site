const fs = require('fs')
const path = require('path')

const root = process.cwd()
const read = file => fs.readFileSync(path.join(root, file), 'utf8')

describe('public profile source-data privacy contract', () => {
  test('public profile data is served through a server-only consent-verified projection', () => {
    const projection = read('src/lib/public-profile.js')
    const route = read('src/app/profile/[id]/page.jsx')
    expect(projection).toContain("import 'server-only'")
    expect(projection).toContain('getAdminClient')
    expect(projection).toContain('PUBLIC_PROFILE_FIELDS')
    expect(projection).not.toMatch(/\b(full_name|display_name|email|phone|cv_url|salary_expectation)\b/)
    expect(route).toContain('getConsentVerifiedPublicProfile')
  })

  test('browser roles cannot read private profile, roster, capability or assessment source tables', () => {
    const migration = read('supabase/migrations/20261111190000_harden_public_profile_source_access.sql')
    for (const statement of [
      'REVOKE SELECT ON TABLE public.profiles FROM anon',
      'REVOKE SELECT ON TABLE public.professional_profiles FROM anon',
      'REVOKE SELECT ON TABLE public.marketplace_public_roster FROM anon, authenticated',
      'REVOKE SELECT ON TABLE public.professional_capabilities FROM anon',
      'REVOKE SELECT ON TABLE public.professional_certificates FROM anon',
      'REVOKE SELECT ON TABLE public.valu_assessments FROM anon',
      'REVOKE SELECT ON TABLE public.users FROM anon',
      'GRANT SELECT, UPDATE ON TABLE public.profiles TO authenticated',
      'GRANT SELECT, INSERT, UPDATE ON TABLE public.professional_profiles TO authenticated',
      'GRANT SELECT ON TABLE public.professional_capabilities TO authenticated',
      'GRANT SELECT ON TABLE public.valu_assessments TO authenticated',
      'GRANT SELECT ON TABLE public.professional_certificates TO authenticated',
      'GRANT SELECT, UPDATE ON TABLE public.enquiries TO authenticated',
      'REVOKE EXECUTE ON FUNCTION public.get_homepage_professional_previews_v2() FROM PUBLIC, anon, authenticated',
    ]) expect(migration).toContain(statement)
    expect(migration).toContain('profiles_owner_or_admin_read')
    expect(migration).toContain('professional_capabilities_owner_select')
    expect(migration).toContain('DROP POLICY IF EXISTS pp_public_read_consent_verified')
    expect(migration).toContain("to_regprocedure('public.set_marketplace_public_listing_consent(boolean)') IS NOT NULL")
  })

  test('public profile visitors do not query the private certificate source table', () => {
    const client = read('src/app/profile/[id]/ProfileClient.jsx')
    const certificateLoader = client.slice(client.indexOf('async function loadCertificates'), client.indexOf('async function load()'))
    expect(certificateLoader).toContain('if (viewer?.id !== professionalId)')
    expect(certificateLoader).toContain('setCertificates([])')
    expect(client).toContain('await loadCertificates(initialProfile.id, user)')
  })
})
