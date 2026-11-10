const fs = require('fs')
const path = require('path')

function read(relative) {
  return fs.readFileSync(path.join(process.cwd(), relative), 'utf8')
}

describe('VALU presentation consistency', () => {
  test('homepage makes the VALU entry clear without exposing internal assessment mechanics', () => {
    const home = read('src/app/page.jsx')
    const hero = read('src/components/HeroSlider.jsx')
    expect(hero).toContain('Discover your capability')
    expect(home).toContain('five PRIME dimensions')
    expect(home).not.toMatch(/(?:9|58)[- ]questions?|<b>9<\/b> QUESTIONS/i)
  })

  test('homepage hero leads with a concise editorial proposition and clear visitor actions', () => {
    const hero = read('src/components/HeroSlider.jsx')
    expect(hero).toContain('Make your')
    expect(hero).toContain('capability')
    expect(hero).toContain('AN INSTITUTION FOR PROFESSIONAL CAPABILITY')
    expect(hero).toContain('Understand what you bring')
    expect(hero).toContain('Discover your capability')
    expect(hero).toContain('Explore the marketplace')
    expect(hero).toContain('vi-hero-art')
    expect(hero).toContain('PRIME')
    expect(hero).toContain('VALU INDEX')
    expect(hero).toContain('Presence')
    expect(hero).toContain('Enterprise')
    expect(hero).not.toMatch(/(?:9|58)[- ]questions?/i)
    expect(hero).not.toContain('84')
  })

  test('homepage gives professionals and organisations two clear routes', () => {
    const home = read('src/app/page.jsx')
    expect(home).toContain('TWO CLEAR WAYS IN')
    expect(home).toContain('PROFESSIONALS')
    expect(home).toContain('ORGANISATIONS')
    expect(home).toContain('Where do you want')
    expect(home).toContain('Explore your VALU Index')
    expect(home).toContain('Explore talent access')
    expect(home).toContain('THE VALORIA STANDARD')
    expect(home).not.toContain('THREE WAYS TO ENGAGE.')
    expect(home).not.toContain('FOUR WAYS TO ENGAGE.')
  })

  test('homepage registry explains VALU points and privacy context', () => {
    const registry = read('src/components/LiveProfilesScroll.jsx')
    expect(registry).toContain('VALU Index results are expressed in points')
    expect(registry).toContain('eligibility and visibility rules')
    expect(registry).toContain('/privacypolicy')
    expect(registry).toContain('const loop = unique')
    expect(registry).not.toContain('unique.slice(0, 4)')
    expect(registry).toContain('Basic marketplace access. Complete the full VALU assessment')
    expect(registry).toContain('const isBasicSnapshot = points === null && summary.length === 0')
  })

  test('marketplace explains snapshot and full assessment without exposing internal question counts', () => {
    const directory = read('src/components/MarketplaceDirectory.jsx')
    expect(directory).toContain('A completed VALU snapshot may support a Basic listing')
    expect(directory).toContain('Completing the full assessment establishes your official VALU Index in points')
    expect(directory).not.toMatch(/(?:9|58)[- ]questions?/i)
  })

  test('public registry and professional-facing score cards use points', () => {
    expect(read('src/components/LiveProfilesScroll.jsx')).toContain('vi-scroll-score-max">points')
    expect(read('src/app/profile/[id]/ProfileClient.jsx')).toContain('> points</span>')
    expect(read('src/app/profile/onboarding/page.jsx')).toContain('<span> points</span>')
    expect(read('src/app/profile/passport/page.jsx')).toContain(' points</b>')
    expect(read('src/app/profile/settings/page.jsx')).toContain(' points</strong>')
    expect(read('src/components/ValueActivationCard.jsx')).toContain('points')
  })

  test('public marketplace suppresses the identified low-quality records until verified corrections exist', () => {
    const directoryData = read('src/lib/marketplace-data.js')
    expect(directoryData).toContain('help people find meaning in their life and career')
    expect(directoryData).toContain('valoria professional')
    expect(directoryData).toContain('isPublicProfileContentReady(row)')
    expect(directoryData).toContain('headline,current_job_title')
    expect(directoryData).toContain('1D400')
    expect(directoryData).toContain('1D7FF')
  })

  test('brand line punctuation is consistent in the shared brand source and metadata', () => {
    expect(read('src/lib/brand.js')).toContain("tagline: 'Worth. Built.'")
    expect(read('src/app/layout.jsx')).toContain('Valoria Institute — Worth, Built.')
    expect(read('src/app/layout.jsx')).not.toContain('Worth. Built.')
  })

  test('left alignment is enforced across route copy and desktop/mobile dropdown content', () => {
    const alignment = read('src/styles/left-alignment.css')
    expect(alignment).toContain('text-align: left !important')
    expect(alignment).toContain('.vi-nav .nav-dropdown')
    expect(alignment).toContain('.nav-mobile .nav-dropdown')
    expect(alignment).toContain('align-items: flex-start !important')
  })

  test('PRIME uses the canonical future-ready skills and five approved VALU merit designations', () => {
    const brand = read('src/lib/brand.js')
    const prime = read('src/app/prime/page.jsx')
    expect(brand).toContain("name: 'Presence'")
    expect(brand).toContain("name: 'Relationships'")
    expect(brand).toContain("name: 'Intelligence'")
    expect(brand).toContain("name: 'Mastery'")
    expect(brand).toContain("name: 'Enterprise'")
    expect(brand).toContain("'AI Fluency'")
    expect(brand).toContain("'Human-AI Collaboration'")
    for (const tier of ['Force to Align With', 'Emerging Force', 'Developing Professional', 'Building Foundations', 'At the Starting Point']) {
      expect(prime).toContain(tier)
    }
    expect(prime).toContain('80–100 POINTS')
    expect(prime).toContain('65–79 POINTS')
    expect(prime).toContain('50–64 POINTS')
    expect(prime).toContain('35–49 POINTS')
    expect(prime).toContain('BELOW 35 POINTS')
    expect(brand).toContain("name: 'Force to Align With'")
    expect(brand).toContain("min: 0, max: 34, name: 'At the Starting Point'")
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
