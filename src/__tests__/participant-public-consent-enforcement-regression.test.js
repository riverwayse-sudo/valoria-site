const fs = require('fs')
const path = require('path')

const migration = fs.readFileSync(
  path.join(process.cwd(), 'supabase/migrations/20261114211500_restore_participant_public_consent_enforcement.sql'),
  'utf8'
)

describe('participant public-profile consent enforcement', () => {
  test('the consent helper requires the latest participant-entered public acknowledgement', () => {
    expect(migration).toContain("acknowledgement.acknowledgement_version = 'public-profile-visibility-v3-2026-11-07'")
    expect(migration).toContain("acknowledgement.source IN ('profile_setup', 'profile_edit')")
    expect(migration).toContain('ORDER BY acknowledgement.acknowledged_at DESC NULLS LAST')
    expect(migration).not.toMatch(/SELECT\s+TRUE\s*;/i)
  })

  test('listing reconciliation uses the same canonical consent predicate', () => {
    expect(migration).toContain('public_consent_ok := private.has_public_profile_consent(p_professional_id)')
    expect(migration).toContain('Expected one legacy consent block in sync_professional_listing_status')
  })

  test('reconciliation removes only public projection and visibility, not participant records', () => {
    expect(migration).toContain('SET visibility = \'registered_only\'')
    expect(migration).toContain('DELETE FROM public.marketplace_public_roster')
    expect(migration).not.toMatch(/DELETE\s+FROM\s+public\\.professional_profiles/i)
    expect(migration).not.toMatch(/DELETE\s+FROM\s+public\\.professional_profile_acknowledgements/i)
    expect(migration).not.toMatch(/UPDATE\s+public\\.valu_assessments/i)
    expect(migration).not.toMatch(/UPDATE\s+public\\.professional_capabilities/i)
  })

  test('the helper remains private to trusted database execution', () => {
    expect(migration).toContain('REVOKE ALL ON FUNCTION private.has_public_profile_consent(uuid) FROM PUBLIC, anon, authenticated')
    expect(migration).toContain('GRANT EXECUTE ON FUNCTION private.has_public_profile_consent(uuid) TO service_role')
  })
})
