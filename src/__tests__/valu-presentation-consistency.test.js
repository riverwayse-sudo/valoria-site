const fs = require('fs')
const path = require('path')

function read(relative) {
  return fs.readFileSync(path.join(process.cwd(), relative), 'utf8')
}

describe('VALU presentation consistency', () => {
  test('homepage keeps the professional VALU entry clear without exposing internal assessment mechanics', () => {
    const home = read('src/app/page.jsx')
    expect(home).toContain('START THE VALU TASTER')
    expect(home).toContain('separate full assessment')
    expect(home).toContain('build your professional profile')
    expect(home).not.toMatch(/(?:9|58)[- ]questions?|<b>9<\/b> QUESTIONS/i)
  })

  test('homepage hero leads with marketplace value and clear visitor actions', () => {
    const hero = read('src/components/HeroSlider.jsx')
    expect(hero).toContain('Make your')
    expect(hero).toContain('Understand what you bring. Build what comes next. Be discovered for what you can do.')
    expect(hero).toContain('AN INSTITUTION FOR PROFESSIONAL CAPABILITY')
    expect(hero).toContain('DESIGNED FOR A GLOBAL PROFESSIONAL LANDSCAPE.')
    expect(hero).toContain('Discover your capability')
    expect(hero).toContain('Explore the marketplace')
    expect(hero).toContain('vi-hero-art')
    expect(hero).toContain('PRIME')
    expect(hero).toContain('VALU INDEX')
    expect(hero).toContain('href="/marketplace"')
    expect(hero).toContain('Explore the standard')
    expect(hero).not.toContain('HUMAN CAPITAL INSTITUTION')
    expect(hero).not.toContain('Talent is not the problem.')
    expect(hero).not.toMatch(/(?:9|58)[- ]questions?/i)
    expect(hero).not.toContain('84')
  })

  test('homepage presents the three approved professional and buyer pathways', () => {
    const home = read('src/app/page.jsx')
    expect(home).toContain('THREE WAYS TO ENGAGE.')
    expect(home).not.toContain('FOUR WAYS TO ENGAGE.')
    expect(home).toContain('FOR PROFESSIONALS')
    expect(home).toContain('FOR EMPLOYERS')
    expect(home).toContain('FOR EVENT ORGANISERS · FOR FACILITATORS & TRAINING BUYERS')
    expect(home).toContain('Know where you stand.')
    expect(home).toContain('Hire by capability, not CV triage.')
    expect(home).toContain('Find expertise that can hold a room.')
  })

  test('VALU Index page explains the taster and separate full assessment without progress mechanics', () => {
    const valu = read('src/app/valu/page.jsx')
    expect(valu).toContain('Know where you stand,')
    expect(valu).toContain('separate full assessment')
    expect(valu).toContain('official points-based VALU Index')
    expect(valu).toContain('Future-Ready skill — critical for the professional talent market of 2025 to 2035.')
    expect(valu).toContain('How you create. Enterprise measures the capacity to generate value beyond a task')
    expect(valu).toContain('cannot be purchased or transferred')
    expect(valu).not.toMatch(/1 of 9|1 of 58/i)
  })

  test('About page follows the approved story and states institutional boundaries plainly', () => {
    const about = read('src/app/about-us/page.jsx')
    expect(about).toContain('Why Valoria')
    expect(about).toContain('The mechanisms that turn talent into opportunity are.')
    for (const statement of ['Not a recruitment agency', 'Not a training company', 'Not a speaker bureau', 'The VALU Index is not itself a certification', 'Not a jobs board']) {
      expect(about).toContain(statement)
    }
    expect(about).toContain('Africa-first')
    expect(about).toContain('Continental expansion is a 2028 priority')
    expect(about).toContain('VISION · MISSION · PURPOSE')
    expect(about).toContain('An Africa where professional merit always finds its platform.')
    expect(about).toContain("To build and operate Africa's premier professional capability marketplace")
    expect(about).toContain('To bridge the gap between latent brilliance and institutional scale.')
    expect(about).not.toContain('human capital institution')
  })

  test('homepage registry explains VALU points and privacy context', () => {
    const registry = read('src/components/LiveProfilesScroll.jsx')
    expect(registry).toContain('VALU Index results are expressed in points')
    expect(registry).toContain('eligibility and visibility rules')
    expect(registry).toContain('/privacypolicy')
    expect(registry).toContain('const loop = unique')
    expect(registry).not.toContain('unique.slice(0, 4)')
    expect(registry).toContain('profile.assessment_summary || profile.headline')
    expect(registry).toContain('const isBasicSnapshot = points === null && summary.length === 0 && headline.length >= 3')
  })

  test('marketplace explains snapshot and full assessment without exposing internal question counts', () => {
    const directory = read('src/components/MarketplaceDirectory.jsx')
    expect(directory).toContain('A completed VALU snapshot may support a Basic listing')
    expect(directory).toContain('Completing the full assessment establishes your official VALU Index in points')
    expect(directory).not.toMatch(/(?:9|58)[- ]questions?/i)
  })

  test('public registry and professional-facing score cards use points', () => {
    expect(read('src/components/LiveProfilesScroll.jsx')).toContain('className="vi-scroll-score-max"')
    expect(read('src/components/LiveProfilesScroll.jsx')).toContain("? 'points' : 'ACCESS'")
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
    const directory = read('src/components/MarketplaceDirectory.jsx')
    expect(directory).toContain('function getDevelopmentFocus(profile)')
    expect(directory).toContain('if (entries.length !== 5) return')
    expect(directory).toContain('Top development area:')
    expect(directory).toContain('TOP DEVELOPMENT AREA')
  })

  test('brand line punctuation is consistent in the shared brand source and metadata', () => {
    expect(read('src/lib/brand.js')).toContain("tagline: 'Worth. Built.'")
    expect(read('src/app/layout.jsx')).toContain('Valoria Institute — Worth. Built.')
    expect(read('src/app/layout.jsx')).not.toContain('Worth, Built.')
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
