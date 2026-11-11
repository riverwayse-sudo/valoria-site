const fs = require('fs')
const path = require('path')

const read = file => fs.readFileSync(path.join(process.cwd(), file), 'utf8')

describe('Canonical Valoria content contract', () => {
  test('PRIME exposes the approved seventeen skills across five clusters', () => {
    const brand = read('src/lib/brand.js')
    const skills = [
      'Communication', 'Negotiation', 'Personal Brand & Executive Presence',
      'Emotional Intelligence', 'Conflict Resolution', 'People Development', 'Stakeholder Management',
      'Critical Thinking', 'Strategic Thinking', 'Business Acumen', 'AI Fluency',
      'Execution & Accountability', 'Resilience & Self-Leadership', 'Adaptability',
      'Commercial Creativity', 'Influence Without Authority', 'Human-AI Collaboration',
    ]
    for (const skill of skills) expect(brand).toContain("'" + skill + "'")
    expect(skills).toHaveLength(17)
    expect(brand).toContain("subtitle: 'How you create'")
    expect(brand).toContain("displaySuffix: 'points'")
    expect(brand).not.toContain("displaySuffix: '/100'")
  })

  test('the full assessment uses the canonical five designations', () => {
    const brand = read('src/lib/brand.js')
    const engine = read('src/scoringEngine.js')
    const designations = [
      'Force to Align With',
      'Emerging Force',
      'Developing Professional',
      'Building Foundations',
      'At the Starting Point',
    ]
    for (const designation of designations) {
      expect(brand).toContain("name: '" + designation + "'")
      expect(engine).toContain('name: "' + designation + '"')
    }
    expect(brand).toContain("if (assessmentLevel !== 'full' || points == null")
    expect(brand).toContain('meritTier: false')
  })

  test('public taster copy keeps the taster and full assessment distinct without exposing counters', () => {
    const valu = read('src/app/valu/page.jsx')
    const start = read('src/app/valu/start/page.jsx')
    const homepage = read('src/app/page.jsx')
    const about = read('src/app/about-us/page.jsx')
    const homepageProfiles = read('src/components/LiveProfilesScroll.jsx')
    for (const source of [valu, start, homepage]) {
      expect(source).not.toContain('Question 1 of 9')
      expect(source).not.toContain('Question 1 of 58')
      expect(source).not.toContain('1 of 9')
      expect(source).not.toContain('1 of 58')

    }
    expect(valu).toContain('Begin with the VALU Taster.')
    expect(valu).not.toContain('four Intelligence skills')
    expect(valu).not.toContain('15 to 20 minutes')
    expect(valu).not.toContain('12-month validity period')
    expect(valu).toContain('separate full assessment')
    expect(valu).not.toMatch(/(?:9|58)[- ]questions?|nine questions|54 scored questions|four validity checks/i)
    expect(homepage).not.toMatch(/nine questions|(?:9|58)[- ]questions?/i)
    expect(about).toContain('Professional Capability Institution')
    expect(about).toContain('The VALU Index is not itself a certification')
    expect(homepage).toContain('Take the taster')
    expect(homepage).toContain('Complete the full assessment')
    expect(homepage).toContain('Build your profile')
    expect(homepage).toContain('Become discoverable')
    expect(homepageProfiles).toContain('profile.headline')
    expect(homepageProfiles).toContain('PLACEHOLDER_HEADLINES')
    expect(homepageProfiles).not.toContain('assessed, positioned and discoverable')
    expect(start).toContain('separate assessment')
  })
})
