const fs = require('fs')
const path = require('path')

const read = (file) => fs.readFileSync(path.join(process.cwd(), file), 'utf8')

describe('Valoria public content and legal-copy controls', () => {
  test('the shared PRIME source uses the approved 17-skill framework', () => {
    const brand = read('src/lib/brand.js')
    const expected = [
      'Communication', 'Negotiation', 'Personal Brand & Executive Presence',
      'Emotional Intelligence', 'Conflict Resolution', 'People Development', 'Stakeholder Management',
      'Critical Thinking', 'Strategic Thinking', 'Business Acumen', 'AI Fluency',
      'Execution & Accountability', 'Resilience & Self-Leadership', 'Adaptability',
      'Commercial Creativity', 'Influence Without Authority', 'Human-AI Collaboration',
    ]
    expected.forEach(skill => expect(brand).toContain(skill))
    expect(brand).not.toMatch(/Composure Under Scrutiny|Trust-Building|Collaborative Intelligence|Network Quality|Analytical Depth|Decision-Making|Cognitive Agility|Execution Discipline|Systems Building|Venture Mindset/)
  })

  test('future-ready PRIME skills are marked explicitly', () => {
    const prime = read('src/app/prime/page.jsx')
    expect(prime).toContain('The detailed assessment criteria and scoring thresholds are proprietary.')
    expect(prime).not.toContain('AI Fluency')
    expect(prime).not.toContain('Human-AI Collaboration')
  })

  test('privacy draft discloses the active processors and avoids unsupported assurances', () => {
    const privacy = read('src/app/privacypolicy/page.jsx')
    ;['Supabase', 'Anthropic', 'Resend', 'Brevo', 'Cloudflare'].forEach(provider => expect(privacy).toContain(provider))
    expect(privacy).toContain('LEGAL REVIEW REQUIRED')
    expect(privacy).not.toMatch(/African Talent Bureau Ltd|NDPA 2023 Compliant|No personally identifiable information is sent|anonymised VALU Index score profile|35 or above|retained indefinitely|36 months/)
    expect(privacy).toContain('NEXT_PUBLIC_VALU_PREVIEW')
  })

  test('terms draft separates the taster from the full assessment and avoids unapproved eligibility claims', () => {
    const terms = read('src/app/terms-of-use/page.jsx')
    expect(terms).toContain('VALU taster is a separate, directional starting point')
    expect(terms).toContain('formal assessment provides a comprehensive view')
    expect(terms).not.toMatch(/(?:9|58)[- ]questions?|54 scored questions|validity anchors/i)
    expect(terms).toContain('LEGAL REVIEW REQUIRED')
    expect(terms).not.toMatch(/African Talent Bureau Ltd|35 or above|anonymised score profile|score penalty/)
  })
})
