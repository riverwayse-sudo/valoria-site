#!/usr/bin/env node
// Proves public.check_rate_limit's budget guarantee under GENUINE CONCURRENCY
// against a real PostgreSQL server with multiple simultaneous connections.
//
// WHY THIS EXISTS SEPARATELY FROM verify-rate-limit-migration.mjs
// That verifier runs PGlite, a single-connection embedded engine. It can prove
// the function exists, its signature, its grants, and that a *sequential* fourth
// call is refused. It cannot prove the property the function's comment claims:
// that two requests arriving together cannot both be allowed. With one
// connection, transactions cannot overlap, so the race is unreachable. This
// script starts a real multi-process server and drives N separate connections
// through the function simultaneously.
//
// The interesting property is not "does the counter increment" but "can the
// budget be exceeded". A limiter that admits limit+1 requests under load is a
// limiter that does not limit, and sequential tests cannot see it.
//
//   node scripts/verify-rate-limit-concurrency.mjs
//
// Exits 0 on success, 1 on any failed assertion.

import fs from 'node:fs'
import path from 'node:path'
import net from 'node:net'
import os from 'node:os'
import { execFileSync, spawn } from 'node:child_process'
import { pathToFileURL } from 'node:url'

const MIGRATION = 'supabase/migrations/20261023120000_check_rate_limit_protocol.sql'
const root = process.cwd()
const CACHE_DIR = path.join(root, '.pg-verify')
const PG_VERSION = '18.4.0-beta.17'

const results = []
function check(label, ok, detail = '') {
  results.push({ label, ok })
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? ` — ${detail}` : ''}`)
}
function section(title) {
  console.log(`\n${title}`)
}

function npmInstall(...pkgs) {
  execFileSync('npm', ['install', '--no-save', '--no-audit', '--no-fund', '--prefix', CACHE_DIR, ...pkgs], {
    cwd: root,
    stdio: 'inherit',
  })
}

function resolveBinaries() {
  const binDir = path.join(CACHE_DIR, 'node_modules', '@embedded-postgres', 'linux-x64', 'native', 'bin')
  const need = ['initdb', 'postgres', 'pg_ctl']
  const pgEntry = path.join(CACHE_DIR, 'node_modules', 'pg', 'lib', 'index.js')
  const missing = need.filter((b) => !fs.existsSync(path.join(binDir, b)))
  if (missing.length || !fs.existsSync(pgEntry)) {
    console.log('Provisioning real PostgreSQL into .pg-verify (package.json is not modified)...')
    fs.mkdirSync(CACHE_DIR, { recursive: true })
    // One npm call: a second `--prefix` install prunes the first package's tree.
    npmInstall(`@embedded-postgres/linux-x64@${PG_VERSION}`, 'pg')
  }
  for (const b of need) {
    if (!fs.existsSync(path.join(binDir, b))) throw new Error(`PostgreSQL binary missing: ${path.join(binDir, b)}`)
  }
  if (!fs.existsSync(pgEntry)) throw new Error(`pg client missing: ${pgEntry}`)
  return binDir
}

async function freePort() {
  return new Promise((resolve, reject) => {
    const srv = net.createServer()
    srv.unref()
    srv.on('error', reject)
    srv.listen(0, '127.0.0.1', () => {
      const { port } = srv.address()
      srv.close(() => resolve(port))
    })
  })
}

const binDir = resolveBinaries()
const pgEntry = path.join(CACHE_DIR, 'node_modules', 'pg', 'lib', 'index.js')
const pgMod = await import(pathToFileURL(pgEntry).href)
const Pg = pgMod.default || pgMod

const port = await freePort()
const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'valoria-rl-'))
const logFile = path.join(dataDir, 'server.log')

console.log(`Starting real PostgreSQL (port ${port})`)
execFileSync(path.join(binDir, 'initdb'), ['-D', dataDir, '-U', 'valoria', '--auth=trust', '-E', 'UTF8'], {
  stdio: ['ignore', 'ignore', 'pipe'],
})
const server = spawn(
  path.join(binDir, 'postgres'),
  ['-D', dataDir, '-p', String(port), '-c', 'listen_addresses=127.0.0.1', '-c', 'fsync=off'],
  { stdio: ['ignore', 'ignore', fs.openSync(logFile, 'w')] }
)

async function connect() {
  const c = new Pg.Client({ host: '127.0.0.1', port, user: 'valoria', database: 'postgres' })
  await c.connect()
  return c
}
async function waitReady() {
  for (let i = 0; i < 60; i++) {
    try {
      const c = await connect()
      await c.end()
      return
    } catch {
      await new Promise((r) => setTimeout(r, 250))
    }
  }
  throw new Error(`server not ready; see ${logFile}`)
}

let exitCode = 0
try {
  await waitReady()
  const setup = await connect()
  await setup.query(`create extension if not exists pgcrypto;`)
  // A bare server has none of Supabase's roles. The migration grants to and
  // revokes from anon/authenticated/service_role, so they must exist for it to
  // execute at all. nologin is sufficient: this verifier never connects as them,
  // it only checks privileges.
  await setup.query(`
    do $$ begin
      if not exists (select 1 from pg_roles where rolname = 'anon') then create role anon nologin; end if;
      if not exists (select 1 from pg_roles where rolname = 'authenticated') then create role authenticated nologin; end if;
      if not exists (select 1 from pg_roles where rolname = 'service_role') then create role service_role nologin; end if;
    end $$;
  `)

  section('1. the migration applies to a real PostgreSQL server')
  const migrationSql = fs.readFileSync(path.join(root, MIGRATION), 'utf8')
  try {
    await setup.query(migrationSql)
    check('migration applies', true)
  } catch (err) {
    check('migration applies', false, err.message.split('\n')[0])
  }

  const fn = await setup.query(
    `select p.proname, pg_get_function_result(p.oid) as returns, p.prosecdef as security_definer,
            (select array_to_string(p2.proconfig, ',') from pg_proc p2 where p2.oid = p.oid) as config
       from pg_proc p join pg_namespace n on n.oid = p.pronamespace
      where n.nspname = 'public' and p.proname = 'check_rate_limit'`
  )
  check('function exists', fn.rows.length === 1)
  check('returns boolean', fn.rows[0]?.returns === 'boolean', fn.rows[0]?.returns)
  check('is security definer', fn.rows[0]?.security_definer === true)
  check('has a pinned search_path', /search_path/.test(fn.rows[0]?.config || ''), fn.rows[0]?.config)

  section('2. the budget is enforced sequentially')
  for (let i = 0; i < 3; i++) await setup.query(`select public.check_rate_limit('seq-key', 3, 60)`)
  const fourth = await setup.query(`select public.check_rate_limit('seq-key', 3, 60) as allowed`)
  check('the fourth call in a 3-request window is refused', fourth.rows[0].allowed === false)

  section('3. GENUINE CONCURRENCY — a new key under N simultaneous first requests')
  // The reachable failure this guards: without `on conflict do nothing`, N
  // concurrent first requests all find no row, all try to insert, and all but
  // one raise a unique violation. On the fail-closed routes that surfaces as a
  // 503 on a participant's very first request.
  const LIMIT = 5
  const N = 16
  const clients = await Promise.all(Array.from({ length: N }, () => connect()))
  const concurrent = await Promise.all(
    clients.map((c) =>
      c
        .query(`select public.check_rate_limit('race-key', $1, 60) as allowed`, [LIMIT])
        .then((r) => ({ ok: true, allowed: r.rows[0].allowed }))
        .catch((e) => ({ ok: false, error: e.message.split('\n')[0] }))
    )
  )
  await Promise.all(clients.map((c) => c.end()))

  const errored = concurrent.filter((r) => !r.ok)
  const allowed = concurrent.filter((r) => r.ok && r.allowed === true).length
  const refused = concurrent.filter((r) => r.ok && r.allowed === false).length

  check('no concurrent caller raised', errored.length === 0, errored.map((e) => e.error).join(' | ').slice(0, 120))
  check(
    `exactly ${LIMIT} of ${N} simultaneous first requests were allowed`,
    allowed === LIMIT,
    `${allowed} allowed, ${refused} refused`
  )
  const bucket = await setup.query(`select request_count from public.rate_limit_buckets where rate_key = 'race-key'`)
  check('the stored counter did not exceed the limit', bucket.rows[0]?.request_count === LIMIT, String(bucket.rows[0]?.request_count))

  section('4. mutation — the naive bucket creation is unsound under the same load')
  // Recreates the shape the shipped function's own comment warns against: a bare
  // `select ... for update` followed by `if not found then insert`. `for update`
  // locks no row when the row is absent, so every concurrent first caller
  // concludes "absent" and proceeds to insert; all but one then collide on the
  // unique key. On the fail-closed routes that surfaces as a 503 on a
  // participant's very first request.
  //
  // The sequence is driven from JavaScript with an explicit barrier rather than
  // inside plpgsql, so every connection has completed its existence check before
  // any of them inserts. A sleep inside the function is not enough: if the first
  // caller commits before the others reach their check, they legitimately find
  // the row and no collision occurs.
  await setup.query(`delete from public.rate_limit_buckets where rate_key = 'naive-key'`)

  const mClients = await Promise.all(Array.from({ length: N }, () => connect()))
  let mReleased
  const mBarrier = new Promise((resolve) => {
    mReleased = resolve
  })
  const naiveInsert = `insert into public.rate_limit_buckets(rate_key, window_started_at, request_count, updated_at)
                       values ('naive-key', now(), 1, now())`
  const mutated = mClients.map(async (c) => {
      await c.query('begin')
      const seen = await c.query(`select rate_key from public.rate_limit_buckets where rate_key = 'naive-key' for update`)
      await mBarrier
      if (seen.rows.length === 0) {
        try {
          await c.query(naiveInsert)
          await c.query('commit')
          return { ok: true, sawEmpty: true }
        } catch (e) {
          await c.query('rollback')
          return { ok: false, error: e.message.split('\n')[0], sawEmpty: true }
        }
      }
      await c.query('commit')
      return { ok: true, sawEmpty: false }
    })
  await new Promise((r) => setTimeout(r, 300))
  mReleased()
  const mOutcomes = await Promise.all(mutated)
  await Promise.all(mClients.map((c) => c.end()))

  const mErrored = mOutcomes.filter((r) => !r.ok)
  check(
    'every concurrent first caller observed no bucket (the race is real)',
    mOutcomes.filter((r) => r.sawEmpty).length === N,
    `${mOutcomes.filter((r) => r.sawEmpty).length}/${N}`
  )
  check(
    'the naive shape raises unique violations under concurrent first requests',
    mErrored.length > 0,
    `${mErrored.length} raised: ${mErrored[0]?.error?.slice(0, 90)}`
  )
  check(
    'which is exactly the failure the shipped function avoids',
    mErrored.some((e) => /duplicate key|unique/i.test(e.error || '')),
    mErrored.find((e) => /duplicate key|unique/i.test(e.error || ''))?.error?.slice(0, 90) || 'no unique violation seen'
  )

  section('5. keys are isolated')
  for (let i = 0; i < 3; i++) await setup.query(`select public.check_rate_limit('iso-a', 3, 60)`)
  const isoB = await setup.query(`select public.check_rate_limit('iso-b', 3, 60) as allowed`)
  check('exhausting one key does not consume another', isoB.rows[0].allowed === true)

  section('6. the window expires')
  await setup.query(`select public.check_rate_limit('exp-key', 1, 1)`)
  const blocked = await setup.query(`select public.check_rate_limit('exp-key', 1, 1) as allowed`)
  check('the second call inside a 1s window is refused', blocked.rows[0].allowed === false)
  await new Promise((r) => setTimeout(r, 1200))
  const after = await setup.query(`select public.check_rate_limit('exp-key', 1, 1) as allowed`)
  check('the same call is allowed once the window has passed', after.rows[0].allowed === true)

  section('7. a refused caller cannot extend its own lockout')
  await setup.query(`select public.check_rate_limit('hammer-key', 2, 2)`)
  await setup.query(`select public.check_rate_limit('hammer-key', 2, 2)`)
  const startedAt = await setup.query(`select window_started_at from public.rate_limit_buckets where rate_key = 'hammer-key'`)
  for (let i = 0; i < 5; i++) await setup.query(`select public.check_rate_limit('hammer-key', 2, 2)`)
  const afterHammer = await setup.query(`select window_started_at from public.rate_limit_buckets where rate_key = 'hammer-key'`)
  check(
    'repeated refused calls do not reset the window',
    new Date(startedAt.rows[0].window_started_at).getTime() === new Date(afterHammer.rows[0].window_started_at).getTime()
  )

  section('8. invalid arguments are rejected rather than silently allowed')
  for (const [label, sql] of [
    ['a key shorter than 3 characters', `select public.check_rate_limit('ab', 3, 60)`],
    ['a zero maximum', `select public.check_rate_limit('arg-key', 0, 60)`],
    ['a window beyond one day', `select public.check_rate_limit('arg-key', 3, 90000)`],
    ['a null key', `select public.check_rate_limit(null, 3, 60)`],
  ]) {
    const outcome = await setup.query(sql).then(
      () => ({ raised: false }),
      (e) => ({ raised: true, msg: e.message.split('\n')[0] })
    )
    check(`${label} raises`, outcome.raised, outcome.msg || 'was accepted')
  }

  section('9. the bucket table is not reachable by client roles')
  const grants = await setup.query(
    `select grantee, privilege_type from information_schema.role_table_grants
      where table_schema = 'public' and table_name = 'rate_limit_buckets'`
  )
  const clientGrants = grants.rows.filter((r) => ['anon', 'authenticated', 'PUBLIC'].includes(r.grantee))
  check('no anon/authenticated/PUBLIC grant on the bucket table', clientGrants.length === 0, JSON.stringify(clientGrants))
  const fnGrants = await setup.query(
    `select grantee, privilege_type from information_schema.role_routine_grants
      where routine_schema = 'public' and routine_name = 'check_rate_limit'`
  )
  const execByClient = fnGrants.rows.filter((r) => ['anon', 'authenticated', 'PUBLIC'].includes(r.grantee) && r.privilege_type === 'EXECUTE')
  check('no client role can execute the limiter', execByClient.length === 0, JSON.stringify(execByClient))

  await setup.end()

  const failed = results.filter((r) => !r.ok)
  console.log(`\n${results.length - failed.length}/${results.length} checks passed`)
  if (failed.length) {
    console.error('Failed checks:', failed.map((f) => f.label).join('; '))
    exitCode = 1
  } else {
    console.log('All checks passed.')
  }
} catch (err) {
  console.error('\nverifier error:', err?.message || err)
  exitCode = 1
} finally {
  try {
    server.kill('SIGQUIT')
    await new Promise((r) => setTimeout(r, 400))
  } catch {
    /* best effort */
  }
  try {
    fs.rmSync(dataDir, { recursive: true, force: true })
  } catch {
    /* best effort */
  }
}

process.exit(exitCode)
