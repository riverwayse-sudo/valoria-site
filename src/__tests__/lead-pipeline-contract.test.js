const fs = require('fs')
const path = require('path')

const root = process.cwd()
const read = file => fs.readFileSync(path.join(root, file), 'utf8')

describe('canonical lead pipeline contract', () => {
  test('waitlist writes only to Supabase; Brevo sync is delegated to the queue', () => {
    const source = read('src/app/api/waitlist/route.js')
    expect(source).not.toContain('syncToBrevoList(')
    expect(source).toContain(".from('waitlist')")
  })

  test('lead pipeline migration defines canonical queue and Meta event store', () => {
    const migration = read('supabase/migrations/20260921123000_canonical_lead_pipeline.sql')
    expect(migration).toContain('create table if not exists public.lead_captures')
    expect(migration).toContain('create table if not exists public.meta_lead_events')
    expect(migration).toContain('valoria-sync-leads-to-brevo')
    expect(migration).toContain('valoria-process-meta-leads')
  })

  test('Meta webhook is not JWT-gated and verifies Meta signatures in the function source', () => {
    const fn = read('supabase/functions/meta-lead-webhook/index.ts')
    expect(fn).toContain('x-hub-signature-256')
    expect(fn).toContain('META_APP_SECRET')
    expect(fn).toContain('META_VERIFY_TOKEN')
  })
})
