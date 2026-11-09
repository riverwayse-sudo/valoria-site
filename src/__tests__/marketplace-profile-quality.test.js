const fs = require('fs')
const path = require('path')

const source = fs.readFileSync(path.join(process.cwd(), 'src/lib/marketplace-data.js'), 'utf8')
const rpcMigration = fs.readFileSync(path.join(process.cwd(), 'supabase/migrations/20261109223653_expose_safe_marketplace_public_roster_rpc.sql'), 'utf8')
const privateRpcMigration = fs.readFileSync(path.join(process.cwd(), 'supabase/migrations/20261109223951_move_marketplace_roster_definer_to_private.sql'), 'utf8')
const profileRoute = fs.readFileSync(path.join(process.cwd(), 'src/app/profile/[id]/page.jsx'), 'utf8')
const profileClient = fs.readFileSync(path.join(process.cwd(), 'src/app/profile/[id]/ProfileClient.jsx'), 'utf8')
const homepageProfiles = fs.readFileSync(path.join(process.cwd(), 'src/components/LiveProfilesScroll.jsx'), 'utf8')

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


  test('marketplace cards, homepage previews and public profile routes all use the restricted RPC', () => {
    expect(profileRoute).toContain("rpc('get_marketplace_public_roster_v1'")
    expect(profileClient).toContain("rpc('get_marketplace_public_roster_v1'")
    expect(homepageProfiles).toContain('/rpc/get_marketplace_public_roster_v1')
    expect(profileRoute).not.toContain(".from('marketplace_public_roster')")
    expect(profileClient).not.toContain(".from('marketplace_public_roster')")
    expect(homepageProfiles).not.toContain('get_homepage_professional_previews_v2')
  })

  test('public RPC wrapper is invoker while its private implementation exposes only approved fields', () => {
    expect(privateRpcMigration).toContain('security invoker')
    expect(privateRpcMigration).toContain('private.get_marketplace_public_roster_v1_impl')
    expect(privateRpcMigration).toContain('security definer')
    expect(privateRpcMigration).toContain("set search_path = ''")
    expect(privateRpcMigration).not.toContain('fee_range')
    expect(privateRpcMigration).not.toContain('salary_expectation')
    expect(privateRpcMigration).not.toContain('r.bio')
  })

})
