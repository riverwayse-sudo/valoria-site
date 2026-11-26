const fs = require('fs')
const path = require('path')

const read = file => fs.readFileSync(path.join(process.cwd(), file), 'utf8')

describe('public roster and individual profile visibility safeguards', () => {
  test('the directory uses the consent-gated public roster and profile access remains verified', () => {
    const consent = read('src/lib/profile-consent-copy.js')
    const marketplace = read('src/lib/marketplace-data.js')
    const profile = read('src/lib/public-profile.js')
    const acknowledgementApi = read('src/app/api/profile/acknowledgements/route.js')

    expect(consent).toContain("PUBLIC_PROFILE_CONSENT_SOURCES = Object.freeze(['profile_setup', 'profile_edit', 'admin_attestation'])")
    expect(acknowledgementApi).toContain('PUBLIC_PROFILE_CONSENT_SOURCES.includes(data.source)')
    expect(marketplace).toContain("const SOURCE = 'marketplace_public_roster'")
    expect(marketplace).toContain('getApprovedPublicProfessionalIds(rows)')
    expect(marketplace).not.toContain('professional_profile_acknowledgements')
    expect(profile).toContain(".eq('visibility', 'public')")
    expect(profile).toContain(".eq('listing_status', 'listed')")
    expect(profile).toContain(".eq('is_test', false)")
    expect(profile).toContain(".is('revoked_at', null)")
  })
})
