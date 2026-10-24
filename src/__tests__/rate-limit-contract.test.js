const fs = require('fs')
const path = require('path')

const root = process.cwd()
const read = file => fs.readFileSync(path.join(root, file), 'utf8')

// Every route that consults the shared limiter. Kept explicit so that adding a
// new caller without a matching database contract fails this suite.
const LIMITER_CALLERS = [
  'src/app/api/waitlist/route.js',
  'src/app/api/enquiries/route.js',
  'src/app/api/session-registration/route.js',
  'src/app/api/welcome-email/route.js',
  'src/app/api/careers/applications/route.js',
]

const MIGRATION = 'supabase/migrations/20261023120000_check_rate_limit_protocol.sql'

// Functions that live in the platform repository's migrations but are called
// from this one. They share a database, so they are legitimate — but they are
// listed explicitly so an unlisted cross-repo call cannot slip through.
const PLATFORM_PROVIDED_RPCS = [
  'admin_set_professional_listing',
  'sync_professional_listing_status',
]

describe('check_rate_limit database contract', () => {
  test('a migration defines the function the five routes call', () => {
    // The defect this pins: the function was called from five routes but defined
    // in no migration in either repository, so it existed only as untracked DDL.
    expect(fs.existsSync(path.join(root, MIGRATION))).toBe(true)
    const sql = read(MIGRATION)
    expect(sql).toMatch(/create or replace function\s+public\.check_rate_limit\s*\(/i)
  })

  test('the signature matches the named arguments every caller passes', () => {
    const sql = read(MIGRATION)
    // Extract the declared parameter names.
    const header = sql.match(/function\s+public\.check_rate_limit\s*\(([\s\S]*?)\)\s*returns/i)
    expect(header).not.toBeNull()
    const declared = [...header[1].matchAll(/\b(p_[a-z_]+)\s+(text|integer|int|bigint|numeric)/gi)]
      .map(m => m[1].toLowerCase())

    expect(declared).toEqual(['p_key', 'p_max_count', 'p_window_seconds'])

    // Every caller must use exactly these names — a typo becomes a runtime
    // "function does not exist" error, which the routes swallow as fail-open.
    for (const file of LIMITER_CALLERS) {
      const source = read(file)
      const call = source.match(/\.rpc\(\s*'check_rate_limit'\s*,\s*\{([\s\S]*?)\}\s*\)/)
      expect(call).not.toBeNull()
      const passed = [...call[1].matchAll(/\b(p_[a-z_]+)\s*:/gi)].map(m => m[1].toLowerCase())
      expect(passed.sort()).toEqual([...declared].sort())
    }
  })

  test('it returns a boolean, which is what the callers branch on', () => {
    const sql = read(MIGRATION)
    expect(sql).toMatch(/function\s+public\.check_rate_limit[\s\S]*?returns\s+boolean/i)
    // The callers treat the result as a flag. Returning a row type would make
    // `data !== false` and `data === false` both wrong.
    for (const file of LIMITER_CALLERS) {
      const source = read(file)
      expect(source).toMatch(/check_rate_limit|withinLimit|budget|limit/i)
    }
  })

  test('only the service role may execute it', () => {
    const sql = read(MIGRATION)
    expect(sql).toMatch(
      /revoke all on function\s+public\.check_rate_limit\s*\([^)]*\)\s*from\s+public\s*,\s*anon\s*,\s*authenticated/i
    )
    expect(sql).toMatch(
      /grant execute on function\s+public\.check_rate_limit\s*\([^)]*\)\s+to\s+service_role/i
    )
    // SECURITY DEFINER without a pinned search_path is a privilege-escalation
    // shape; the migration must pin it.
    expect(sql).toMatch(/security definer[\s\S]*?set search_path\s*=/i)
  })

  test('the bucket table is not readable or writable by browser roles', () => {
    const sql = read(MIGRATION)
    expect(sql).toMatch(/alter table\s+public\.rate_limit_buckets\s+enable row level security/i)
    expect(sql).toMatch(
      /revoke all on table\s+public\.rate_limit_buckets\s+from\s+public\s*,\s*anon\s*,\s*authenticated/i
    )
  })

  test('it does not share the opportunity limiter table, whose keys are a different shape', () => {
    // Strip `--` comments first: the migration's prose explains why it avoids
    // that table, and prose is not DDL. Only the executable SQL is inspected.
    const sql = read(MIGRATION).replace(/--[^\n]*/g, '')
    // consume_opportunity_submission_rate_limit rejects key_hash shorter than 32
    // characters. These callers pass short keys like 'waitlist:1.2.3.4', so
    // reusing that table would break the opportunity limiter's invariant.
    expect(sql).not.toMatch(/opportunity_submission_rate_limits/)
    expect(sql).toMatch(/public\.rate_limit_buckets/)
  })

  test('concurrent callers cannot both be allowed past the budget', () => {
    const sql = read(MIGRATION)
    // A plain select-then-update loses a concurrent request; the row must be
    // locked for the duration of the check.
    expect(sql).toMatch(/select \* into v_row[\s\S]*?for update/i)
  })

  test('a spent budget is refused without extending the window', () => {
    const sql = read(MIGRATION)
    const refuse = sql.match(/request_count\s*>=\s*p_max_count\s*then([\s\S]*?)return false/i)
    expect(refuse).not.toBeNull()
    // Incrementing on refusal would let a hammering client hold its own lockout
    // open forever.
    expect(refuse[1]).not.toMatch(/request_count\s*=\s*request_count\s*\+/)
  })

  test('every rpc call in the source tree is defined by a tracked migration', () => {
    const defined = new Set()
    const walk = dir => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name)
        if (entry.isDirectory()) {
          if (entry.name === 'node_modules') continue
          walk(full)
        } else if (entry.name.endsWith('.sql')) {
          const sql = fs.readFileSync(full, 'utf8')
          for (const m of sql.matchAll(/function\s+(?:[a-z_][a-z0-9_]*\.)?([a-z0-9_]+)\s*\(/gi)) {
            defined.add(m[1].toLowerCase())
          }
        }
      }
    }
    walk(path.join(root, 'supabase', 'migrations'))

    const untracked = []
    const scan = dir => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name)
        if (entry.isDirectory()) {
          if (['node_modules', '.next', 'dist'].includes(entry.name)) continue
          scan(full)
        } else if (/\.(js|jsx)$/.test(entry.name)) {
          const source = fs.readFileSync(full, 'utf8')
          for (const m of source.matchAll(/\.rpc\(\s*['"]([a-z0-9_]+)['"]/gi)) {
            const name = m[1].toLowerCase()
            if (defined.has(name)) continue
            if (PLATFORM_PROVIDED_RPCS.includes(name)) continue
            untracked.push(`${name} (${path.relative(root, full)})`)
          }
        }
      }
    }
    scan(path.join(root, 'src'))

    expect(untracked).toEqual([])
  })
})
