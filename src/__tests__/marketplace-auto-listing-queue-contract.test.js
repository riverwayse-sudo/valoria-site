const fs = require('fs')
const path = require('path')

const root = process.cwd()
const read = file => fs.readFileSync(path.join(root, file), 'utf8')

describe('automatic marketplace listing pipeline', () => {
  test('capability and evidence mutations reopen processed queue entries and schedule the worker', () => {
    const migration = read('supabase/migrations/20261102133500_marketplace_auto_listing_queue_repair.sql')
    expect(migration).toContain('processed_at = null')
    expect(migration).toContain('attempts = 0')
    expect(migration).toContain('last_error = null')
    expect(migration).toContain('next_attempt_at = now()')
    expect(migration).toContain('valoria-professional-readiness-refresh')
    expect(migration).toContain("'* * * * *'")
    expect(migration).toContain('private.refresh_professional_readiness_queue(100)')
  })

  test('profile and assessment mutations also reopen processed queue entries', () => {
    const migration = read('supabase/migrations/20261102134500_reopen_profile_assessment_readiness_requests.sql')
    expect(migration).toContain('private.enqueue_readiness_refresh')
    expect(migration).toContain('processed_at = null')
    expect(migration).toContain('attempts = 0')
    expect(migration).toContain('last_error = null')
    expect(migration).toContain('next_attempt_at = now()')
  })

  test('the readiness worker recalculates every active capability before account listing', () => {
    const migration = read('supabase/migrations/20261102134000_sync_capability_readiness_during_auto_listing.sql')
    expect(migration).toContain('private.sync_professional_capability(p_professional_id, cap.capability)')
    expect(migration).toContain('pc.is_active = true')
    expect(migration).toContain('pc.eligible_for_listing = true')
    expect(migration).toContain("pc.eligibility_status = 'listed'")
    expect(migration).toContain('professional_listing_controls')
    expect(migration).toContain('ADMIN_REVOKED')
    expect(migration).toContain('ADMIN_SUSPENDED')
  })
})
