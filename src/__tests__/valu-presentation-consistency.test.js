const fs = require('fs')
const path = require('path')

function read(relative) {
  return fs.readFileSync(path.join(process.cwd(), relative), 'utf8')
}

describe('VALU presentation consistency', () => {
  test('homepage communicates the approved nine-question entry assessment', () => {
    const home = read('src/app/page.jsx')
    expect(home).toContain('<b>9</b> QUESTION TASTER')
    expect(home).not.toContain('<b>15</b> QUESTIONS')
  })

  test('homepage VALU card distinguishes question count from points-based results', () => {
    const hero = read('src/components/HeroSlider.jsx')
    expect(hero).toContain('vc-num">58')
    expect(hero).toContain('vc-denom">QUESTIONS')
    expect(hero).toContain('results expressed in points')
    expect(hero).toContain('54 SCORED · 4 VALIDITY CHECKS')
    for (const cluster of ['Presence', 'Relationships', 'Intelligence', 'Mastery', 'Enterprise']) expect(hero).toContain(cluster)
    expect(hero).not.toContain('DISTINGUISHED')
    expect(hero).not.toContain('vc-denom">/ 100')
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

  test('the prototype is explicitly non-production and starts with nine questions', () => {
    const prototype = read('src/app/test/assessment/page.jsx')
    expect(prototype).toContain('const teaser = [')
    expect(prototype).toContain('].slice(0, 9)')
    expect(prototype).not.toContain('a separate 9-question taster and a separate 58-question full assessment')
    expect(prototype).not.toContain('The taster does not count toward the full assessment')
    expect(prototype).not.toContain('15 thoughtful questions')
    expect(prototype).not.toMatch(/Question\s+\\$?\\{[^}]+\\}\\s+of\\s+\\$?\\{/i)
    expect(prototype).toContain('ASSESSMENT IN PROGRESS')
  })
})
