const fs = require('fs')
const path = require('path')

describe('automatic professional profile listing governance', () => {
  const migrationPath = path.join(
    process.cwd(),
    'supabase/migrations/20261124100000_decouple_profile_listing_from_capability_evidence.sql'
  )

  test('a complete current-VALU profile can enter general listing without capability evidence approval', () => {
    const sql = fs.readFileSync(migrationPath, 'utf8')
    expect(sql).toContain('assessment_ok and coalesce(p.profile_complete, false)')
    expect(sql).toContain('full_listing_ready or basic_profile_ok or basic_taster_ok')
    expect(sql).toContain('sync_professional_capability()')
  })

  test('public consent and admin suspension/revocation remain independent safeguards', () => {
    const sql = fs.readFileSync(migrationPath, 'utf8')
    expect(sql).toContain('Public visibility still requires participant-entered public consent')
    expect(sql).toContain('and not blocked then')
    expect(sql).toContain('private.sync_professional_listing_status(v_professional_id)')
  })

  test('public terms distinguish automatic profile listing from evidence-gated capability lanes', () => {
    const source = fs.readFileSync(path.join(process.cwd(), 'src/app/terms-of-use/page.jsx'), 'utf8')
    expect(source).toContain('listed automatically')
    expect(source).toContain('explicit, recorded consent')
    expect(source).toContain('capability-specific placement')
    expect(source).not.toContain('Listing is not automatic')
  })

  test('profile setup does not imply a manual profile approval queue', () => {
    const source = fs.readFileSync(path.join(process.cwd(), 'src/app/profile/setup/page.jsx'), 'utf8')
    expect(source).toContain('SUBMIT PROFILE')
    expect(source).not.toContain('SUBMIT PROFILE FOR REVIEW')
    expect(source).not.toContain('profile clears review')
    expect(source).toContain('assigned automatically')
  })

  test('dashboard gives existing professionals a direct route to record visibility consent', () => {
    const source = fs.readFileSync(path.join(process.cwd(), 'src/app/dashboard/page.jsx'), 'utf8')
    expect(source).toContain('Choose your marketplace visibility')
    expect(source).toContain('/profile/edit#profile-visibility-title')
    expect(source).toContain("p.visibility !== 'public'")
  })

  test('the migration fails closed if the production function has drifted', () => {
    const sql = fs.readFileSync(migrationPath, 'utf8')
    expect(sql).toContain('IF v_count <> 1 THEN')
    expect(sql).toContain('RAISE EXCEPTION')
    expect(sql).toContain('Automatic full-profile listing gate was not installed')
  })
})
