const fs = require('fs')
const path = require('path')

function read(relative) {
  return fs.readFileSync(path.join(process.cwd(), relative), 'utf8')
}

describe('VALU presentation consistency', () => {
  test('homepage keeps the professional VALU entry clear without exposing internal assessment mechanics', () => {
    const home = read('src/app/page.jsx')
    expect(home).toContain('START THE VALU TASTER')
    expect(home).toContain('five PRIME dimensions')
    expect(home).not.toMatch(/(?:9|58)[- ]questions?|<b>9<\/b> QUESTIONS/i)
  })

  test('institutional homepage establishes Valoria’s category and connected system', () => {
    const home = read('src/app/page.jsx')
    expect(home).toContain('A PROFESSIONAL CAPABILITY INSTITUTION')
    expect(home).toContain('Understand your capability.')
    expect(home).toContain('How Valoria works')
    expect(home).toContain('PRIME Framework')
    expect(home).toContain('VALU Index')
    expect(home).toContain('African Talent Bureau')
    expect(home).toContain('Valoria Develop')
    expect(home).toContain('five PRIME dimensions')
    expect(home).not.toContain('HeroSlider')
    expect(home).not.toMatch(/(?:9|58)[- ]questions?/i)
  })

  test('homepage presents decision-maker and professional pathways', () => {
    const home = read('src/app/page.jsx')
    expect(home).toContain('Five ways to engage.')
    expect(home).toContain('FOR PROFESSIONALS SEEKING DEVELOPMENT')
    expect(home).toContain('FOR EMPLOYERS & TALENT LEADERS')
    expect(home).toContain('FOR EVENT ORGANISERS')
    expect(home).toContain('FOR FACILITATORS & EXPERTS')
    expect(home).toContain('FOR INSTITUTIONS & PARTNERS')
    expect(home).toContain('START A CONVERSATION')
  })

  test('homepage registry explains VALU points and privacy context', () => {
    const registry = read('src/components/LiveProfilesScroll.jsx')
    expect(registry).toContain('VALU Index results are expressed in points')
    expect(registry).toContain('eligibility and visibility rules')
    expect(registry).toContain('/privacypolicy')
  })

  test('marketplace leads with capability-led discovery and protects the public roster', () => {
    const directory = read('src/components/MarketplaceDirectory.jsx')
    expect(directory).toContain('A capability-led registry for discovering professionals, speakers and facilitators.')
    expect(directory).toContain('structured profiles, relevant experience')
    expect(directory).toContain('No generated or unverified profiles are displayed.')
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

  test('PRIME uses the canonical future-ready skills and four VALU v4 merit designations', () => {
    const brand = read('src/lib/brand.js')
    const prime = read('src/app/prime/page.jsx')
    expect(brand).toContain("name: 'Presence'")
    expect(brand).toContain("name: 'Relationships'")
    expect(brand).toContain("name: 'Intelligence'")
    expect(brand).toContain("name: 'Mastery'")
    expect(brand).toContain("name: 'Enterprise'")
    expect(brand).toContain("'AI Fluency'")
    expect(brand).toContain("'Human-AI Collaboration'")
    for (const tier of ['Elite', 'Distinguished', 'Proficient', 'Standard']) {
      expect(prime).toContain(`tier:'${tier}'`)
    }
    expect(prime).toContain('90–100 points')
    expect(prime).toContain('75–89 points')
    expect(prime).toContain('55–74 points')
    expect(prime).toContain('35–54 points')
    expect(prime).toContain('FOUR SCORE-BASED DESIGNATIONS')
    expect(prime).toContain('Scores below 35 points receive no merit designation')
    for (const retired of ['Force to Align With', 'Emerging Force', 'Developing Professional', 'Building Foundations', 'At the Starting Point']) {
      expect(prime).not.toContain(retired)
    }
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
