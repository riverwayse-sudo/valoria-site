const fs = require('fs')
const path = require('path')

const read = file => fs.readFileSync(path.join(process.cwd(), file), 'utf8')

describe('Canonical VALU merit tiers', () => {
  test('public site uses the approved VALU points bands and designations', () => {
    const brand = read('src/lib/brand.js')
    const prime = read('src/app/prime/page.jsx')

    expect(brand).toContain("{ level: 4, min: 80, max: 100, name: 'Force to Align With'")
    expect(brand).toContain("{ level: 3, min: 65, max: 79, name: 'Emerging Force'")
    expect(brand).toContain("{ level: 2, min: 50, max: 64, name: 'Developing Professional'")
    expect(brand).toContain("{ level: 1, min: 35, max: 49, name: 'Building Foundations'")

    for (const tier of ['Force to Align With', 'Emerging Force', 'Developing Professional', 'Building Foundations']) {
      expect(prime).toContain(`name: '${tier}'`)
    }
    for (const retired of ['Elite', 'Distinguished', 'Proficient', 'Standard']) {
      expect(brand).not.toContain(`name: '${retired}'`)
      expect(prime).not.toContain(`name: '${retired}'`)
    }
  })

  test('scores below 35 receive no merit designation and remain outside score eligibility', () => {
    const brand = read('src/lib/brand.js')
    expect(brand).toContain("if (score < 35 || score > VALU_SCORE.maximum) return null")
  })

  test('basic listings remain without an official merit tier', () => {
    const brand = read('src/lib/brand.js')
    expect(brand).toContain("meritTier: false")
    expect(brand).toContain("if (assessmentLevel !== 'full' || points == null")
  })
  test('marketplace and individual profiles share one canonical PRIME cluster mapping', () => {
    const brand = read('src/lib/brand.js')
    const directory = read('src/components/MarketplaceDirectory.jsx')
    const profile = read('src/app/profile/[id]/ProfileClient.jsx')
    expect(brand).toContain('export const PRIME_CLUSTER_NAMES = Object.fromEntries(PRIME_CLUSTERS.map')
    expect(directory).toContain('CLUSTER_NAMES = PRIME_CLUSTER_NAMES')
    expect(profile).toContain('PRIME_CLUSTER_NAMES[letter]')
    expect(profile).toContain('PRIME_CLUSTERS.map(({ letter, color })')
  })


  test('PRIME uses the canonical 17 skills and approved cluster themes', () => {
    const brand = read('src/lib/brand.js')
    const prime = read('src/app/prime/page.jsx')
    const clusterNames = ['Presence', 'Relationships', 'Intelligence', 'Mastery', 'Enterprise']
    const canonicalSkills = [
      'Communication', 'Negotiation', 'Personal Brand & Executive Presence',
      'Emotional Intelligence', 'Conflict Resolution', 'People Development', 'Stakeholder Management',
      'Critical Thinking', 'Strategic Thinking', 'Business Acumen', 'AI Fluency',
      'Execution & Accountability', 'Resilience & Self-Leadership', 'Adaptability',
      'Commercial Creativity', 'Influence Without Authority', 'Human-AI Collaboration',
    ]
    expect(brand).toContain("subtitle: 'How you create'")
    expect(brand).not.toContain("How you build")
    expect(brand.match(/skills: \[/g)).toHaveLength(5)
    for (const skill of canonicalSkills) expect(brand).toContain(skill)
    for (const retired of ['Composure Under Scrutiny', 'Trust-Building', 'Collaborative Intelligence', 'Network Quality', 'Analytical Depth', 'Decision-Making', 'Cognitive Agility', 'Execution Discipline', 'Commercial Thinking', 'Systems Building', 'Venture Mindset']) {
      expect(brand).not.toContain(retired)
    }
    expect(prime).toContain('Five clusters.')
    expect(clusterNames).toHaveLength(5)
  })

  test('Develop programme focus areas use the canonical PRIME skill names', () => {
    const brand = read('src/lib/brand.js')
    const programmes = read('src/app/programmes/page.jsx')
    const canonicalSkills = [
      'Communication', 'Negotiation', 'Personal Brand & Executive Presence',
      'Emotional Intelligence', 'Conflict Resolution', 'People Development', 'Stakeholder Management',
      'Critical Thinking', 'Strategic Thinking', 'Business Acumen', 'AI Fluency',
      'Execution & Accountability', 'Resilience & Self-Leadership', 'Adaptability',
      'Commercial Creativity', 'Influence Without Authority', 'Human-AI Collaboration',
    ]
    for (const skill of canonicalSkills) {
      expect(brand).toContain(skill)
    }
    expect(programmes).toContain('{c.skills.join(\' · \')}')
    for (const retired of [
      'Composure under scrutiny', 'Trust-building', 'Collaborative intelligence',
      'Network quality', 'Analytical depth', 'Decision-making', 'Cognitive agility',
      'Execution discipline', 'Commercial thinking', 'Systems building', 'Venture mindset',
    ]) {
      expect(programmes).not.toContain(retired)
    }
  })

})
