const fs = require('fs')
const path = require('path')

function read(relative) {
  return fs.readFileSync(path.join(process.cwd(), relative), 'utf8')
}

describe('journey integrity contract', () => {
  test('journey state fails loudly when required database reads fail', () => {
    const source = read('src/app/api/journey/state/route.js')
    expect(source).toContain('query_errors')
    expect(source).toContain('status: 502')
    expect(source).toContain("require('@/lib/journey-state')")
  })

  test('journey diagnostics exists and requires authentication', () => {
    const source = read('src/app/api/journey/diagnostics/route.js')
    expect(source).toContain("Authentication required.")
    expect(source).toContain('invariant_failures')
    expect(source).toContain('all_required_reads_verified')
  })

  test('historical assessment claim verifies every critical persistence step', () => {
    const source = read('src/app/api/assessment/claim/route.js')
    expect(source).toContain('verifyError')
    expect(source).toContain('verifyTaster')
    expect(source).toContain('identityError')
    expect(source).toContain('journeyError')
    expect(source).toContain('auditError')
  })

  test('value activation is idempotent and does not silently lose its audit event', () => {
    const source = read('src/app/api/journey/value-activation/route.js')
    expect(source).toContain('alreadyActivated')
    expect(source).toContain('eventError')
    expect(source).toContain('Value activation plan does not exist yet')
  })

  test('opportunity matching does not silently treat database errors as zero matches', () => {
    const source = read('src/app/api/opportunities/matches/route.js')
    expect(source).toContain('query_errors')
    expect(source).toContain('status:502')
  })

  test('opportunity submission removes the created opportunity if submission persistence fails', () => {
    const source = read('src/app/api/opportunities/route.js')
    expect(source).toContain("from('opportunities').delete()")
  })

  test('opportunity application flow has both professional and employer endpoints', () => {
    const apply = read('src/app/api/opportunities/applications/route.js')
    const employer = read('src/app/api/employer/applications/route.js')
    const dashboard = read('src/app/employer/dashboard/page.jsx')
    expect(apply).toContain("from('opportunity_applications')")
    expect(apply).toContain("event_type: 'application'")
    expect(employer).toContain("application_status_changed")
    expect(dashboard).toContain('/api/employer/applications')
  })

  test('production smoke gate covers the canonical public and unauthenticated API surfaces', () => {
    const source = read('scripts/production-smoke.mjs')
    for (const marker of [
      '/test/assessment',
      '/opportunities',
      '/marketplace',
      '/api/journey/state',
      '/api/journey/diagnostics',
      '/api/opportunities/matches',
      '/api/outcomes',
    ]) expect(source).toContain(marker)
  })
  
  test('marketplace uses the canonical public roster and counts multi-capability professionals uniquely', () => {
    const source = read('src/lib/marketplace-data.js')
    expect(source).toContain("const SOURCE = 'marketplace_public_roster'")
    expect(source).toContain('new Set()')
    expect(source).toContain('row.capabilities')
  })

  test('legacy PRIME color tokens are removed from the active design system', () => {
    const globals = read('src/styles/globals.css')
    const facilitator = read('src/app/facilitators/page.jsx')
    for (const token of ['--teal', '--blue', '--purple', '--amber', '--coral']) {
      expect(globals).not.toContain(token)
    }
    expect(facilitator).not.toContain('COLORS.teal')
    expect(facilitator).not.toContain('#1D9E75')
  })

  test('marketplace pages use the canonical capability vocabulary', () => {
    const pages = [
      read('src/app/marketplace/talent/page.jsx'),
      read('src/app/marketplace/speakers/page.jsx'),
      read('src/app/marketplace/facilitators/page.jsx'),
    ].join('\n')
    expect(pages).toContain("getMarketplaceRows('candidate')")
    expect(pages).toContain("getMarketplaceRows('speaker')")
    expect(pages).toContain("getMarketplaceRows('facilitator')")
  })
})
