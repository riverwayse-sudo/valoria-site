const fs = require('fs')
const path = require('path')

function read(relative) {
  return fs.readFileSync(path.join(process.cwd(), relative), 'utf8')
}

describe('VALU presentation consistency', () => {
  test('homepage communicates registration before the VALU taster without exposing question counts', () => {
    const home = read('src/app/page.jsx')
    expect(home).toContain('Register before your taster')
    expect(home).toContain('START THE VALU INDEX TASTER')
    expect(home).not.toMatch(/9 questions|58 questions|Question\s+\d+\s+of\s+\d+/i)
    expect(home).not.toContain('no account needed')
    expect(home).not.toMatch(/\\b9\\s*QUESTIONS\\b|\\b58\\s*QUESTIONS\\b/i)
    const waitlist = read('src/components/WaitlistModal.jsx')
    expect(waitlist).not.toMatch(/\\b9\\s*QUESTIONS\\b|\\b58\\s*QUESTIONS\\b/i)
  })
  test('participant-facing surfaces use VALU Index as the product name', () => {
    const surfaces = [
      read('src/app/valu/page.jsx'),
      read('src/app/valu/start/page.jsx'),
      read('src/app/dashboard/page.jsx'),
      read('src/app/profile/setup/page.jsx'),
      read('src/components/MarketplaceDirectory.jsx'),
      read('src/app/professional-signup/page.jsx'),
      read('src/app/privacypolicy/page.jsx'),
      read('src/app/profile/onboarding/page.jsx'),
      read('src/components/VALUJourneyProgress.jsx'),
      read('src/app/prime/page.jsx'),
      read('src/app/test/assessment/page.jsx'),
      read('src/app/insights/page.jsx'),
      read('src/app/login/page.jsx'),
      read('src/app/api/link-taster/route.js'),
      read('src/app/api/valu-handoff/route.js'),
      read('src/app/signup/page.jsx'),
      read('src/components/LiveProfilesScroll.jsx'),
    ];
    for (const surface of surfaces) {
      expect(surface).not.toMatch(/VALU\s+assessment/i);
      expect(surface).not.toMatch(/VALU\s+Index\s+assessment/i);
      expect(surface).not.toMatch(/\bVALU\s+(?!Index\b)[A-Za-z]+/i);
      expect(surface).not.toMatch(/VALU\s+taster(?!\s+index)/i);
    }
    expect(read('src/app/valu/page.jsx')).toContain('VALU Index Taster');
    expect(read('src/app/valu/start/page.jsx')).toContain('full VALU Index');
    expect(read('src/app/page.jsx')).toContain('START THE VALU INDEX TASTER');
    expect(read('src/app/prime/page.jsx')).toContain('TAKE THE VALU INDEX TASTER');
    expect(read('src/app/insights/page.jsx')).toContain('START THE VALU INDEX TASTER');
    expect(read('src/app/signup/page.jsx')).toContain('TAKE THE VALU INDEX TASTER');
    expect(read('src/components/LiveProfilesScroll.jsx')).toContain('TAKE THE VALU INDEX TASTER');
  })

  test('homepage VALU card uses the approved points-based PRIME presentation', () => {
    const hero = read('src/components/HeroSlider.jsx')
    expect(hero).toContain('POINTS-BASED CAPABILITY PROFILE')
    expect(hero).toContain('PRIME framework · results expressed in points')
    for (const cluster of ['Presence', 'Relationships', 'Intelligence', 'Mastery', 'Enterprise']) {
      expect(hero).toContain(cluster)
    }
    expect(hero).not.toContain('/ 100')
  })
  test('public registry and professional-facing score cards use points', () => {
    expect(read('src/components/LiveProfilesScroll.jsx')).toContain('vi-scroll-score-max">points')
    expect(read('src/app/profile/[id]/ProfileClient.jsx')).toContain('> points</span>')
    expect(read('src/app/profile/onboarding/page.jsx')).toContain('<span> points</span>')
    expect(read('src/app/profile/passport/page.jsx')).toContain(' points</b>')
    expect(read('src/app/profile/settings/page.jsx')).toContain(' points</strong>')
    expect(read('src/components/ValueActivationCard.jsx')).toContain('points')
  })

  test('legacy stored designation strings cannot override the canonical points-based merit bands', () => {
    expect(read('src/app/dashboard/page.jsx')).not.toContain('p.designation.replace')
    expect(read('src/app/report/page.jsx')).not.toContain('assessment.designation ||')
    expect(read('src/app/profile/[id]/ProfileClient.jsx')).not.toContain('p.designation.replace')
    expect(read('src/app/profile/onboarding/page.jsx')).not.toContain('valu.designation ||')
    expect(read('src/app/profile/passport/page.jsx')).not.toContain('profile?.designation||')
  })

  test('email confirmation never exposes internal taster or full-assessment question counts', () => {
    const callback = read('src/app/auth/callback/page.jsx')
    expect(callback).not.toMatch(/opening nine|9-question|58-question|Question\s+\d+\s+of\s+\d+/i)
    expect(callback).toContain('your saved VALU Index Taster is connected')
  })

  test('public marketplace and homepage merit labels are derived from canonical VALU points, not stored legacy labels', () => {
    const directory = read('src/components/MarketplaceDirectory.jsx')
    const homepage = read('src/components/LiveProfilesScroll.jsx')
    expect(directory).toContain("getValuTier(p.valu_index, 'full')")
    expect(directory).not.toContain('displayText(p.designation)')
    expect(directory).toContain("styles[tier.name.toLowerCase()]")
    expect(homepage).toContain("getValuTier(profile.valu_index, 'full')")
    expect(homepage).not.toContain('displayText(profile.designation)')
    const adminRoster = read('src/app/admin/marketplace-roster/page.jsx')
    expect(adminRoster).toContain("getValuTier(profile.valu_points, 'full')")
    expect(adminRoster).not.toContain('profile.designation.toUpperCase()')
  })

  test('the shared score display contract declares points, not a percentage suffix', () => {
    const brand = read('src/lib/brand.js')
    expect(brand).toContain("unit: 'points'")
    expect(brand).toContain("displaySuffix: 'points'")
    expect(brand).not.toContain("displaySuffix: '/100'")
  })

  test('the assessment prototype is explicitly non-production and hides internal question mechanics', () => {
    const prototype = read('src/app/test/assessment/page.jsx')
    expect(prototype).toContain('This is a shortened prototype only.')
    expect(prototype).toContain('does not create an account, send email or store your responses')
    expect(prototype).not.toMatch(/Question\s+\d+\s+of\s+\d+/i)
    expect(prototype).not.toMatch(/9 opening questions|remaining 49 questions|58 in total/i)
  })
})
