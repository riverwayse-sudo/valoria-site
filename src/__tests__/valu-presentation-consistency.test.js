const fs = require('fs')
const path = require('path')

function read(relative) {
  return fs.readFileSync(path.join(process.cwd(), relative), 'utf8')
}

describe('VALU presentation consistency', () => {
  test('homepage communicates the approved nine-question entry assessment', () => {
    const home = read('src/app/page.jsx')
    expect(home).toContain('<b>9</b> QUESTIONS')
    expect(home).not.toContain('<b>15</b> QUESTIONS')
  })

  test('homepage hero communicates Valoria’s capability-marketplace positioning', () => {
    const hero = read('src/components/HeroSlider.jsx')
    expect(hero).toContain('AFRICA\'S PROFESSIONAL CAPABILITY MARKETPLACE')
    expect(hero).toContain('Capability should decide')
    expect(hero).toContain('who gets <em>seen.</em>')
    expect(hero).toContain('build a stronger professional presence')
    expect(hero).toContain('START THE 9-QUESTION TASTER')
    expect(hero).toContain('hero-stage')
    expect(hero).toContain('THE PRIME FRAMEWORK')
    expect(hero).not.toContain('vc-denom')
    expect(hero).not.toContain('FORCE TO ALIGN WITH')
    expect(hero).not.toContain('84')
  })

  test('homepage presents five distinct audience pathways', () => {
    const home = read('src/app/page.jsx')
    expect(home).toContain('Five ways to engage.')
    expect(home).toContain('FOR PROFESSIONALS')
    expect(home).toContain('FOR EMPLOYERS')
    expect(home).toContain('FOR EVENT ORGANISERS')
    expect(home).toContain('FOR FACILITATORS & EXPERTS')
    expect(home).toContain('FOR INSTITUTIONS & PARTNERS')
  })

  test('homepage registry explains VALU points and privacy context', () => {
    const registry = read('src/components/LiveProfilesScroll.jsx')
    expect(registry).toContain('VALU Index results are expressed in points')
    expect(registry).toContain('eligibility and visibility rules')
    expect(registry).toContain('/privacypolicy')
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

  test('the shared score display contract declares points, not a percentage suffix', () => {
    const brand = read('src/lib/brand.js')
    expect(brand).toContain("unit: 'points'")
    expect(brand).toContain("displaySuffix: 'points'")
    expect(brand).not.toContain("displaySuffix: '/100'")
  })

  test('the legacy prototype redirects to the canonical separate taster', () => {
    const prototype = read('src/app/test/assessment/page.jsx')
    expect(prototype).toContain("redirect('/valu/assessment/')")
    expect(prototype).not.toContain('QUESTIONS.slice(0, 9)')
    expect(prototype).not.toContain('remaining 49')
    expect(prototype).not.toContain('9 opening questions')
    expect(prototype).not.toContain('15 thoughtful questions')
  })
})
