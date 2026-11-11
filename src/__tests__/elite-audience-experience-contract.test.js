const fs = require('fs')
const path = require('path')

const read = file => fs.readFileSync(path.join(process.cwd(), file), 'utf8')

describe('1% of the 1% audience experience contract', () => {
  const develop = read('src/app/develop/page.jsx')
  const connect = read('src/app/atb-connect/page.jsx')
  const spotlight = read('src/app/atb-spotlight/page.jsx')
  const directory = read('src/components/MarketplaceDirectory.jsx')

  test('development is framed around consequential work and institution-specific needs', () => {
    expect(develop).toContain('work that carries consequence')
    expect(develop).toContain('accomplished professionals, leadership teams and institutions')
    expect(develop).toContain('not a generic training catalogue')
    expect(develop).toContain('scope, faculty and availability are confirmed')
    expect(develop).toContain('remains in development')
    expect(develop).toContain('not currently offered as a completed certification')
  })

  test('ATB Connect supports senior decision-making without overstating VALU', () => {
    expect(connect).toContain('consequential appointments')
    expect(connect).toContain('hiring leaders and institutions')
    expect(connect).toContain('does not replace independent due diligence, credential checks, references or professional judgment')
    expect(connect).toContain('availability depends on the approved public roster')
  })

  test('ATB Spotlight speaks to institutional briefs and preserves certification boundaries', () => {
    expect(spotlight).toContain('executive briefings, leadership forums and consequential institutional gatherings')
    expect(spotlight).toContain('visibility choices and Valoria')
    expect(spotlight).toContain('Facilitator certification remains in development')
    expect(spotlight).toContain('suitability are confirmed for each brief')
  })

  test('Marketplace presents approved public information and assessment context without implying credential verification', () => {
    expect(directory).toContain('declared capabilities, relevant experience and approved public profile information')
    expect(directory).toContain('not a credential verification or a substitute for independent professional diligence')
    expect(directory).toContain('APPROVED PUBLIC PROFILES')
    expect(directory).toContain('CAPABILITY · EXPERIENCE · PRIME')
    expect(directory).toContain('Contact details and individual assessment answers are not displayed')
  })

  test('Registry publication is independent across a professional’s selected capabilities', () => {
    const acceptance = read('docs/GLOBAL_INSTITUTIONAL_REDESIGN_ACCEPTANCE.md')
    expect(acceptance).toContain('Evaluate and publish each capability independently.')
    expect(acceptance).toContain('pending lane must not invalidate or hide the already-approved listing')
    expect(acceptance).toContain('General Registry discoverability and category-specific listing eligibility are separate states.')
  })

  test('authenticated profile surfaces preserve American English conventions', () => {
    const publicProfile = read('src/app/profile/[id]/ProfileClient.jsx')
    const edit = read('src/app/profile/edit/page.jsx')
    const setup = read('src/app/profile/setup/page.jsx')
    for (const source of [publicProfile, edit, setup]) {
      expect(source).not.toMatch(/\bprogramme types\b/i)
      expect(source).not.toMatch(/\borganisation\b/i)
      expect(source).not.toMatch(/\borganise\b/i)
    }
    expect(publicProfile).toContain('Program Types')
    expect(publicProfile).toContain('for a program?')
    expect(edit).toContain('Organization')
    expect(edit).toContain('Program types')
    expect(setup).toContain('Valoria organize your capability profile')
  })

  test('dashboard only reports published capabilities as listed and treats each listing independently', () => {
    const dashboard = read('src/app/dashboard/page.jsx')
    expect(dashboard).toContain("capabilities.filter(c => c.is_active && c.eligible_for_listing === true && c.eligibility_status === 'listed')")
    expect(dashboard).toContain("activeCapabilities.some(c => c.eligible_for_listing === true && c.eligibility_status === 'listed')")
    expect(dashboard).not.toContain("c.eligibility_status === 'listed' || c.eligible_for_listing === true")
    expect(dashboard).not.toContain("eligibilityReady && activeCapabilities.every(c => c.eligibility_status === 'listed')")
  })

  test('authenticated profile and dashboard journeys use US conventions and explicit public consent', () => {
    const dashboard = read('src/app/dashboard/page.jsx')
    const setup = read('src/app/profile/setup/page.jsx')
    const visibility = read('src/components/PublicMarketplaceVisibility.jsx')
    expect(dashboard).toContain("toLocaleDateString('en-US'")
    expect(dashboard).not.toContain("toLocaleDateString('en-GB'")
    expect(setup).toContain("visibility: 'registered_only'")
    expect(setup).toContain('PublicMarketplaceVisibility')
    expect(setup).toContain('profile completion never grants public-display consent')
    expect(setup).toContain('What program types do you run?')
    expect(setup).toContain('Organization')
    expect(setup).toContain('Your profile has been submitted for review.')
    expect(setup).not.toContain('founding cohort')
    expect(setup).not.toContain('usually within 48 hours')
    expect(visibility).toContain('Public visibility is optional')
    expect(visibility).toContain('I authorise Valoria Institute to display')
    expect(visibility).toContain('I understand I can withdraw this permission at any time.')
  })
})
