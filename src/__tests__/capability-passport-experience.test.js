const fs = require('fs')
const path = require('path')

const passport = fs.readFileSync(path.join(process.cwd(), 'src/app/profile/passport/page.jsx'), 'utf8')

describe('Capability Passport experience', () => {
  test('shows VALU as points and separates profile completion from marketplace listing', () => {
    expect(passport.toLowerCase()).toContain('valu index')
    expect(passport).toContain('points')
    expect(passport).not.toContain('/100')
    expect(passport).toContain('profileReady ? \'Complete\' : \'In progress\'')
    expect(passport).toContain('listedCount ?')
    expect(passport).toContain('Profile completion, capability eligibility and marketplace listing are separate decisions.')
  })

  test('shows each active capability with its own governed status and outstanding requirements', () => {
    expect(passport).toContain(".eq('is_active', true)")
    expect(passport).toContain('capabilities.map(capability')
    expect(passport).toContain('capabilityStatus(capability)')
    expect(passport).toContain('capability.missing_requirements')
    expect(passport).toContain("capability.eligibility_status === 'listed' && capability.eligible_for_listing === true")
  })

  test('connects profile owners to the existing evidence submission flow', () => {
    expect(passport).toContain("href=\"/profile/evidence\"")
    expect(passport).toContain("admin.from('professional_documents')")
    expect(passport).toContain('capability_id,document_type,verification_status')
    expect(passport.toLowerCase()).toContain('submit evidence')
    expect(passport).toContain('Under review')
  })

  test('does not let the passport itself write capability eligibility or listing state', () => {
    expect(passport).not.toContain('.update(')
    expect(passport).not.toContain('.upsert(')
    expect(passport).not.toContain('eligible_for_listing:')
    expect(passport).not.toContain('listing_status:')
  })
  test('dashboard exposes evidence submission when a capability is waiting on evidence review', () => {
    const dashboard = fs.readFileSync(path.join(process.cwd(), 'src/app/dashboard/page.jsx'), 'utf8')
    expect(dashboard).toContain("href=\"/profile/evidence\"")
    expect(dashboard).toContain('SUBMIT EVIDENCE')
    expect(dashboard).toContain('/evidence|approval/i')
  })

  test('profile completion confirmation points to the passport without implying listing approval', () => {
    const setup = fs.readFileSync(path.join(process.cwd(), 'src/app/profile/setup/page.jsx'), 'utf8')
    expect(setup).toContain('Your professional profile is complete and saved.')
    expect(setup).toContain("router.push('/profile/passport')")
    expect(setup).toContain('Profile completion does not automatically create a marketplace listing.')
    expect(setup).not.toContain('submitted to the founding cohort')
  })

  test('evidence guidance is evaluated per capability rather than across the whole profile', () => {
    expect(passport).toContain('const capabilityEvidenceGaps = capabilities.some(capability')
    expect(passport).toContain('documents.some(document => document.capability_id === capability.id)')
    expect(passport).toContain('requiresCapabilityEvidence && !hasEvidenceForCapability')
  })

})
