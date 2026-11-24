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

  test('the migration fails closed if the production function has drifted', () => {
    const sql = fs.readFileSync(migrationPath, 'utf8')
    expect(sql).toContain('IF v_count <> 1 THEN')
    expect(sql).toContain('RAISE EXCEPTION')
    expect(sql).toContain('Automatic full-profile listing gate was not installed')
  })
})
