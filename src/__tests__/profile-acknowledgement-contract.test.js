const fs = require('fs')
const path = require('path')

const read = relative => fs.readFileSync(path.join(__dirname, relative), 'utf8')
const route = read('../app/api/profile/acknowledgement/route.js')
const setup = read('../app/profile/setup/page.jsx')

describe('professional profile submission acknowledgement', () => {
  test('the server verifies the signed-in, confirmed owner and complete profile', () => {
    expect(route).toContain('db.auth.getUser(token)')
    expect(route).toContain('user.email_confirmed_at')
    expect(route).toContain(".from('professional_profiles')")
    expect(route).toContain('if (!profile.profile_complete)')
  })

  test('the acknowledgement text and version are owned by the server', () => {
    expect(route).toContain("const ACKNOWLEDGEMENT_VERSION = 'profile-submission-v1'")
    expect(route).toContain("const ACKNOWLEDGEMENT_TYPE = 'profile_submission'")
    expect(route).toContain(".from('professional_profile_acknowledgements')")
    expect(route).toContain('acknowledgement_text: ACKNOWLEDGEMENT_TEXT')
  })

  test('profile submission records the acknowledgement before showing success', () => {
    expect(setup).toContain("fetch('/api/profile/acknowledgement'")
    expect(setup).toContain('JSON.stringify({ acknowledged: true })')
    expect(setup).toContain('acknowledgementResponse.ok')
    expect(setup).toContain('profile_complete')
  })

  test('the profile assessment CTA targets the assessment service', () => {
    expect(setup).toContain('https://assessment.valoriainstitute.com/valu/assessment/')
  })
})
