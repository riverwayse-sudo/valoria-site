const fs = require('fs')
const path = require('path')

const read = file => fs.readFileSync(path.join(process.cwd(), file), 'utf8')

describe('participant-entered public profile consent guard', () => {
  test('only participant-controlled profile setup and edit acknowledgements qualify for public display', () => {
    const consent = read('src/lib/profile-consent-copy.js')
    const marketplace = read('src/lib/marketplace-data.js')
    const profile = read('src/lib/public-profile.js')
    const migration = read('supabase/migrations/20261113094935_require_participant_entered_public_profile_consent.sql')

    expect(consent).toContain("PUBLIC_PROFILE_CONSENT_SOURCES = Object.freeze(['profile_setup', 'profile_edit'])")
    expect(marketplace).toContain(".select('professional_id,acknowledgement_version,source')")
    expect(marketplace).toContain('PUBLIC_PROFILE_CONSENT_SOURCES.includes(acknowledgement.source)')
    expect(profile).toContain(".select('id,acknowledgement_version,source')")
    expect(profile).toContain('PUBLIC_PROFILE_CONSENT_SOURCES.includes(acknowledgement?.source)')
    expect(profile).toContain(".select('professional_id,acknowledgement_version,source')")
    expect(profile).toContain('PUBLIC_PROFILE_CONSENT_SOURCES.includes(acknowledgement.source)')
    expect(migration).toContain("acknowledgement.source IN ('profile_setup', 'profile_edit')")
    expect(migration).toContain('DELETE FROM public.marketplace_public_roster')
    expect(migration).not.toContain('DELETE FROM public.professional_profiles')
  })
})
