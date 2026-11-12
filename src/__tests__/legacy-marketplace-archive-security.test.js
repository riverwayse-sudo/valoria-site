const fs = require('fs')
const path = require('path')

const root = process.cwd()
const read = file => fs.readFileSync(path.join(root, file), 'utf8')

describe('legacy marketplace archive access contract', () => {
  test('the retired archive is not publicly readable or writable', () => {
    const migration = read('supabase/migrations/20261112120621_revoke_public_legacy_marketplace_archive_access.sql')
    expect(migration).toContain('DROP POLICY IF EXISTS marketplace_profiles_public_read')
    expect(migration).toContain('ON public.legacy_marketplace_profiles_archive')
    expect(migration).toContain('REVOKE ALL PRIVILEGES')
    expect(migration).toContain('FROM PUBLIC, anon, authenticated')
    expect(migration).not.toMatch(/\b(DROP TABLE|TRUNCATE|DELETE FROM)\b/i)
  })
})
