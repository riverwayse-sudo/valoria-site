const fs = require('fs')
const path = require('path')

const root = process.cwd()
const read = file => fs.readFileSync(path.join(root, file), 'utf8')

describe('VALUI marketplace lifecycle contract', () => {
  test('marketplace canonical query route has a real redirect import', () => {
    const source = read('src/app/marketplace/page.jsx')
    expect(source).toContain("import { redirect } from 'next/navigation'")
    expect(source).toContain("redirect(CANONICAL[forcedTrack])")
  })

  test('profile onboarding does not submit platform-owned governance fields', () => {
    const source = read('src/app/profile/setup/page.jsx')
    expect(source).not.toContain('existingListingStatusRef')
    expect(source).not.toMatch(/listing_status\s*:/)
    expect(source).not.toMatch(/eligible_for_listing\s*:/)
    expect(source).not.toMatch(/profile_complete:\s*!!/)
    expect(source).not.toMatch(/visibility:\s*['"]registered_only['"]/)
  })

  test('taster handoff derives ownership from the authenticated session', () => {
    const source = read('src/app/api/link-taster/route.js')
    expect(source).toContain("request.headers.get('authorization')")
    expect(source).toContain('userClient.auth.getUser()')
    expect(source).not.toContain('const { taster_id: tasterId, user_id: userId')
    expect(source).not.toContain('getUserById(userId)')
  })

  test('assessment identity handoff is server-side and email-bound', () => {
    const source = read('src/app/api/link-assessment/route.js')
    expect(source).toContain('userClient.auth.getUser()')
    expect(source).toContain('assessment.email')
    expect(source).toContain("admin.from('valu_assessments')")
    expect(source).toContain(".update({ user_id: user.id })")
  })

  test('email confirmation preserves the pending taster handoff', () => {
    const signup = read('src/app/professional-signup/page.jsx')
    const login = read('src/app/login/page.jsx')
    expect(signup).toContain('pending_taster_id')
    expect(signup).toContain('emailRedirectTo')
    expect(login).toContain('pending_taster_id')
    expect(login).toContain('/api/link-taster')
  })

  test('public VALU pages use the authoritative PRIME vocabulary', () => {
    const valu = read('src/app/valu/page.jsx')
    const start = read('src/app/valu/start/page.jsx')
    for (const source of [valu, start]) {
      expect(source).toContain('Presence')
      expect(source).toContain('Relationships')
      expect(source).toContain('Intelligence')
      expect(source).toContain('Mastery')
      expect(source).toContain('Enterprise')
    }
    expect(start).not.toContain("'Professionalism'")
    expect(start).not.toContain("'Motivation & Stamina'")
  })
})
