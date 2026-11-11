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
    expect(connect).toContain('does not replace independent diligence, credential checks, references or professional judgment')
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
})
