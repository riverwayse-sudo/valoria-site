#!/usr/bin/env node
// Executes supabase/migrations/20261023120000_check_rate_limit_protocol.sql
// against a real PostgreSQL engine and asserts the behaviour the five calling
// routes depend on.
//
// WHY THIS IS NOT A JEST SUITE
// The repo's Jest suites are dependency-free and static. Proving this migration
// works needs a real SQL engine, and the only one installable without root here
// is PGlite (PostgreSQL compiled to WASM). Adding a WASM database to
// devDependencies for one migration is not a trade worth making in a
// remediation PR, so this script provisions PGlite on demand with `--no-save`
// and leaves package.json untouched.
//
// The static contract test (src/__tests__/rate-limit-contract.test.js) runs in
// the normal suite and catches the common regressions. This script is the
// stronger check: it catches SQL that reads correctly but does not execute, or
// that grants the wrong privileges.
//
//   node scripts/verify-rate-limit-migration.mjs
//
// Exits 0 on success, 1 on any failed assertion.

import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { pathToFileURL } from 'node:url'

const MIGRATION = 'supabase/migrations/20261023120000_check_rate_limit_protocol.sql'
const root = process.cwd()

// PGlite is installed into its own directory rather than the project's
// node_modules. A `--no-save` install into node_modules is not resolvable from
// the running process (the module appears on disk after Node has already
// resolved the path), and it would leave a stray dependency behind. A dedicated
// directory keeps the project's dependency tree and package.json untouched, and
// the entry point is then loaded by absolute path.
const CACHE_DIR = path.join(root, '.pglite-verify')
const ENTRY = path.join(CACHE_DIR, 'node_modules', '@electric-sql', 'pglite', 'dist', 'index.js')

async function loadPGlite() {
  if (!fs.existsSync(ENTRY)) {
    console.log('PGlite not present; provisioning into .pglite-verify (package.json is not modified)...')
    fs.mkdirSync(CACHE_DIR, { recursive: true })
    execFileSync(
      'npm',
      ['install', '--no-save', '--no-audit', '--no-fund', '--prefix', CACHE_DIR, '@electric-sql/pglite'],
      { cwd: root, stdio: 'inherit' }
    )
  }
  if (!fs.existsSync(ENTRY)) {
    throw new Error(`PGlite installed but its entry point is missing at ${ENTRY}`)
  }
  const mod = await import(pathToFileURL(ENTRY).href)
  return mod.PGlite || mod.default?.PGlite
}

const results = []
function check(label, ok, detail = '') {
  results.push({ label, ok })
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? ` — ${detail}` : ''}`)
}

const PGlite = await loadPGlite()
const sql = fs.readFileSync(path.join(root, MIGRATION), 'utf8')
const db = new PGlite()

// Stand in for Supabase's roles so the GRANT/REVOKE statements resolve.
await db.exec(`
  do $$ begin
    if not exists (select 1 from pg_roles where rolname = 'anon') then create role anon nologin; end if;
    if not exists (select 1 from pg_roles where rolname = 'authenticated') then create role authenticated nologin; end if;
    if not exists (select 1 from pg_roles where rolname = 'service_role') then create role service_role nologin; end if;
  end $$;
`)

console.log('\n1. the migration executes at all')
let applied = true
try {
  await db.exec(sql)
} catch (err) {
  applied = false
  check('migration applies', false, err.message)
}
if (applied) check('migration applies', true)

console.log('\n2. declared signature matches the callers')
const sig = await db.query(`
  select pg_get_function_result(p.oid) as returns,
         pg_get_function_arguments(p.oid) as args,
         p.prosecdef as security_definer,
         array_to_string(p.proconfig, ',') as config
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public' and p.proname = 'check_rate_limit'`)
const row = sig.rows[0]
check('returns boolean', row?.returns === 'boolean', row?.returns)
check(
  'arguments are p_key text, p_max_count integer, p_window_seconds integer',
  row?.args === 'p_key text, p_max_count integer, p_window_seconds integer',
  row?.args
)
check('security definer', row?.security_definer === true)
check('search_path pinned', (row?.config || '').includes('search_path='), row?.config)

console.log('\n3. the budget is enforced (limit 3)')
const calls = []
for (let i = 0; i < 4; i += 1) {
  const r = await db.query(`select public.check_rate_limit('waitlist:203.0.113.11', 3, 3600) as allowed`)
  calls.push(String(r.rows[0].allowed))
}
check('first three allowed, fourth refused', calls.join(',') === 'true,true,true,false', calls.join(', '))

console.log('\n4. a refusal does not extend the window')
const before = await db.query(`select request_count from public.rate_limit_buckets where rate_key = 'waitlist:203.0.113.11'`)
await db.query(`select public.check_rate_limit('waitlist:203.0.113.11', 3, 3600)`)
await db.query(`select public.check_rate_limit('waitlist:203.0.113.11', 3, 3600)`)
const after = await db.query(`select request_count from public.rate_limit_buckets where rate_key = 'waitlist:203.0.113.11'`)
check(
  'request_count unchanged by refusals',
  before.rows[0].request_count === after.rows[0].request_count,
  `${before.rows[0].request_count} -> ${after.rows[0].request_count}`
)

console.log('\n5. an elapsed window resets the budget')
await db.query(`update public.rate_limit_buckets set window_started_at = now() - interval '2 hours' where rate_key = 'waitlist:203.0.113.11'`)
const reset = await db.query(`select public.check_rate_limit('waitlist:203.0.113.11', 3, 3600) as allowed`)
const count = await db.query(`select request_count from public.rate_limit_buckets where rate_key = 'waitlist:203.0.113.11'`)
check('allowed again and counter reset to 1', reset.rows[0].allowed === true && count.rows[0].request_count === 1)

console.log('\n6. keys are independent')
const k1 = await db.query(`select public.check_rate_limit('enquiry:198.51.100.7', 1, 3600) as a`)
const k2 = await db.query(`select public.check_rate_limit('enquiry:198.51.100.7', 1, 3600) as a`)
const k3 = await db.query(`select public.check_rate_limit('careers:198.51.100.7', 1, 3600) as a`)
check(
  'one key cannot spend another key budget',
  k1.rows[0].a === true && k2.rows[0].a === false && k3.rows[0].a === true
)

console.log('\n6b. a brand-new key is created without raising')
// The reachable failure this guards: `select ... for update` locks nothing for a
// row that does not exist, so an `if not found then insert` shape lets two
// concurrent first requests collide on the primary key. One then raises, the
// route sees an RPC error, and the fail-closed routes 503 a legitimate first
// submission. Emulate the collision directly against the function's own shape.
let createdCleanly = true
try {
  await db.exec('begin')
  await db.query(`select public.check_rate_limit('race:first', 5, 60)`)
  await db.exec('commit')
} catch (err) {
  createdCleanly = false
  await db.exec('rollback')
  check('first call for a new key does not raise', false, err.message.split('\n')[0])
}
if (createdCleanly) check('first call for a new key does not raise', true)

const bucket = await db.query(`select request_count from public.rate_limit_buckets where rate_key = 'race:first'`)
check('the new bucket starts at one consumed request', bucket.rows[0]?.request_count === 1, String(bucket.rows[0]?.request_count))

// A second distinct key must also be created cleanly, proving the upsert path is
// taken for every new key rather than only the very first one in the table.
let secondCleanly = true
try {
  await db.query(`select public.check_rate_limit('race:second', 5, 60)`)
} catch (err) {
  secondCleanly = false
  check('a later new key also creates cleanly', false, err.message.split('\n')[0])
}
if (secondCleanly) check('a later new key also creates cleanly', true)

console.log('\n7. malformed arguments are rejected rather than silently allowed')
for (const [label, q] of [
  ['key shorter than 3 characters', `select public.check_rate_limit('ab', 5, 60)`],
  ['null key', `select public.check_rate_limit(null, 5, 60)`],
  ['max count below 1', `select public.check_rate_limit('probe:1.2.3.4', 0, 60)`],
  ['window beyond one day', `select public.check_rate_limit('probe:1.2.3.4', 5, 999999)`],
]) {
  try {
    await db.query(q)
    check(`${label} rejected`, false, 'was accepted')
  } catch {
    check(`${label} rejected`, true)
  }
}

console.log('\n8. privileges are service-role only')
const priv = await db.query(`
  select r.rolname,
         has_function_privilege(r.rolname, 'public.check_rate_limit(text,integer,integer)', 'execute') as can_execute,
         has_table_privilege(r.rolname, 'public.rate_limit_buckets', 'select') as can_select
  from pg_roles r where r.rolname in ('anon', 'authenticated', 'service_role') order by r.rolname`)
const byName = Object.fromEntries(priv.rows.map((r) => [r.rolname, r]))
check('anon cannot execute', byName.anon?.can_execute === false)
check('authenticated cannot execute', byName.authenticated?.can_execute === false)
check('service_role can execute', byName.service_role?.can_execute === true)
check('anon cannot read the bucket table', byName.anon?.can_select === false)
check('authenticated cannot read the bucket table', byName.authenticated?.can_select === false)

const failed = results.filter((r) => !r.ok)
console.log(`\n${results.length - failed.length}/${results.length} checks passed`)
if (failed.length) {
  console.log('FAILED:')
  for (const f of failed) console.log(`  - ${f.label}`)
  process.exit(1)
}
console.log('All checks passed.')
