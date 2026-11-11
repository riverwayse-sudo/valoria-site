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
    expect(home).not.toMatch(/(?:9|58)[- ]questions?|<b>9<\/b> QUESTIONS|54 scored questions|four validity checks/i)
  })

  test('homepage hero leads with marketplace value and clear visitor actions', () => {
    const hero = read('src/components/HeroSlider.jsx')
    expect(hero).toContain('Capability deserves')
    expect(hero).toContain('For accomplished professionals and the organizations that rely on their judgment, Valoria brings structure to how capability is assessed, developed and discovered.')
    expect(hero).toContain('AN INSTITUTION FOR PROFESSIONAL CAPABILITY')
    expect(hero).toContain('WORTH. BUILT. — CAPABILITY, CONSIDERED WITH INTENT.')
    expect(hero).toContain('Explore your capability')
    expect(hero).toContain('Understand the PRIME framework')
    expect(hero).toContain('vi-hero-art')
    expect(hero).toContain('PRIME')
    expect(hero).toContain('VALU INDEX')
    expect(hero).toContain('href="/prime"')
    expect(hero).toContain('Explore the framework')
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
    expect(home).toContain('FOR EVENT ORGANIZERS · FOR FACILITATORS & PROGRAM LEADERS')
    expect(home).toContain('Make your capability legible.')
    expect(home).toContain('See beyond the résumé.')
    expect(home).toContain('Engage expertise with intention.')
  })

  test('VALU Index page explains the taster and separate full assessment without progress mechanics', () => {
    const valu = read('src/app/valu/page.jsx')
    expect(valu).toContain('Understand your capability.')
    expect(valu).toContain('separate full assessment')
    expect(valu).toContain('official points-based VALU Index')
    expect(valu).not.toContain('Future-Ready skill')
    expect(valu).not.toContain('AI Fluency')
    expect(valu).not.toContain('Human-AI Collaboration')
    expect(valu).toContain('The VALU Index does not independently verify qualifications, work history or professional competence.')
    expect(valu).not.toContain('four Intelligence skills')
    expect(valu).not.toContain('12-month validity period')
    expect(valu).toContain('How you create. Enterprise describes how professional capability contributes to value and sustainable outcomes.')
    expect(valu).toContain('cannot be purchased or transferred')
    expect(valu).not.toMatch(/1 of 9|1 of 58|(?:9|58)[- ]questions?|54 scored questions|four validity checks/i)
  })

  test('About page follows the approved story and states institutional boundaries plainly', () => {
    const about = read('src/app/about-us/page.jsx')
    expect(about).toContain('Why Valoria')
    expect(about).toContain('The mechanisms that turn talent into opportunity are.')
    for (const statement of ['Not a recruitment agency', 'Not a training company', 'Not a speaker bureau', 'The VALU Index is not itself a certification', 'Not a jobs board']) {
      expect(about).toContain(statement)
    }
    expect(about).toContain('international professional landscape')
    expect(about).toContain('no global accreditation or universal recognition is implied')
    expect(about).toContain('VISION · MISSION · PURPOSE')
    expect(about).toContain('A professional landscape in which consequential capability can be understood with precision, developed with intent and connected to meaningful opportunity.')
    expect(about).toContain("To build and operate a trusted professional capability institution")
    expect(about).toContain('To make professional capability more legible to the people and institutions responsible for developing, selecting and engaging it.')
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
    expect(registry).toContain("const isBasic = profile.assessment_access === 'basic'")
    expect(registry).toContain("isBasic ? 'PROFILE' : 'VALU INDEX'")
    expect(registry).toContain("isBasic ? 'PUBLIC' : profile.valu_index")
    expect(registry).toContain("!isBasic && <span className=\"vi-scroll-score-max\">points</span>")
    expect(registry).not.toContain("'ACCESS'")
    expect(registry).not.toContain("'BASIC'")
    const marketplaceData = read('src/lib/marketplace-data.js')
    expect(marketplaceData).toContain('isPublicProfileContentReady(row)')
    expect(marketplaceData).toContain("assessmentAccess === 'basic'")
    expect(marketplaceData).toContain("assessmentAccess === 'full'")
    expect(marketplaceData).toContain('fullAssessmentReady')
  })

  test('marketplace explains snapshot and full assessment without exposing internal question counts', () => {
    const directory = read('src/components/MarketplaceDirectory.jsx')
    expect(directory).toContain('declared capabilities, relevant experience and approved public profile information')
    expect(directory).toContain('not a credential verification or a substitute for independent professional diligence')
    expect(directory).toContain('Where available, a completed VALU assessment adds structured context in points and an assessment-informed summary')
    expect(directory).not.toMatch(/(?:9|58)[- ]questions?/i)
  })

  test('public registry and professional-facing score cards use points', () => {
    expect(read('src/components/LiveProfilesScroll.jsx')).toContain('className="vi-scroll-score-max"')
    expect(read('src/components/LiveProfilesScroll.jsx')).toContain('>points</span>')
    expect(read('src/components/LiveProfilesScroll.jsx')).not.toContain("'ACCESS'")
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
