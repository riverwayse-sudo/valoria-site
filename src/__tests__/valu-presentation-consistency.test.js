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

  test('homepage illustrative VALU card uses points and the current merit designation', () => {
    const hero = read('src/components/HeroSlider.jsx')
    expect(hero).toContain('vc-denom">POINTS')
    expect(hero).toContain('FORCE TO ALIGN WITH')
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
    expect(prototype).toContain('9 opening questions followed by the remaining 49 questions (58 in total)')
    expect(prototype).not.toContain('15 thoughtful questions')
  })
})
