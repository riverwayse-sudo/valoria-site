const fs = require('fs')
const path = require('path')

const source = fs.readFileSync(path.join(process.cwd(), 'src/lib/marketplace-data.js'), 'utf8')
const rpcMigration = fs.readFileSync(path.join(process.cwd(), 'supabase/migrations/20261109223653_expose_safe_marketplace_public_roster_rpc.sql'), 'utf8')

describe('public marketplace profile content gate', () => {
  test('keeps Basic access distinct from Full assessment and earned merit', () => {
    expect(source).toContain("assessmentAccess === 'basic'")
    expect(source).toContain("assessmentAccess === 'full'")
    expect(source).toContain('isValidAssessmentAccess')
  })

  test('requires official points and a VALU report summary for Full profiles only', () => {
    expect(source).toContain('hasOfficialPoints')
    expect(source).toContain('assessmentSummary.length >= 12')
    expect(source).toContain('fullAssessmentReady')
  })

  test('blocks placeholder and stylised profile copy from public display', () => {
    expect(source).toContain("'growth dev'")
    expect(source).toContain("'model'")
    expect(source).toContain("'valoria professional'")
    expect(source).toContain('help people find meaning in their life and career')
    expect(source).toContain('1D400')
    expect(source).toContain('1D7FF')
  })
  test('exports the public profile quality gate used by profile pages and sitemap', () => {
    expect(source).toContain('export function isPublicProfileContentReady(row)')
  })


  test('reads the public roster through the safe RPC instead of direct table access', () => {
    expect(source).toContain("supabase.rpc('get_marketplace_public_roster_v1')")
    expect(source).not.toContain(".from(SOURCE)")
  })

  test('accepts legitimate short role titles and normalises Unicode ATB identifiers for validation', () => {
    expect(source).toContain("headline.length >= 3")
    expect(source).toContain("normalize('NFKC')")
  })


  test('public roster RPC is tightly scoped and omits compensation and free-form bio fields', () => {
    expect(rpcMigration).toContain('security definer')
    expect(rpcMigration).toContain("set search_path = ''")
    expect(rpcMigration).toContain('revoke all on function')
    expect(rpcMigration).toContain('grant execute')
    expect(rpcMigration).not.toContain('fee_range')
    expect(rpcMigration).not.toContain('salary_expectation')
    expect(rpcMigration).not.toContain('r.bio')
  })

})
