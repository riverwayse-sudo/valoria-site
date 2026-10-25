// src/__tests__/environment-write-guard.test.js
//
// Regression coverage for src/lib/environment-guard.js and its use in middleware.
//
// Incident: Vercel's preview environment is configured with the same Supabase URL
// and service-role key as production. Thirty-two route handlers build their own
// service-role client and none checked which environment it was running in, so a
// preview deployment wrote to the production database. The staging acceptance
// suite could not be run for that reason.
//
// The decision is a pure function, so every combination is exercised here without
// a deployment. The middleware assertions confirm the guard is wired in ahead of
// the /api bypass, so deleting the call fails this suite.

const fs = require('fs')
const path = require('path')

const guard = require('../lib/environment-guard')

const PROD_REF = 'abcdefghijklmnopqrst' // 20 chars
const STAGE_REF = 'zyxwvutsrqponmlkjihg' // 20 chars
const prodUrl = `https://${PROD_REF}.supabase.co`
const stageUrl = `https://${STAGE_REF}.supabase.co`

const root = process.cwd()
const read = file => fs.readFileSync(path.join(root, file), 'utf8')

describe('supabaseProjectRef', () => {
  test('reads the ref from a standard Supabase URL', () => {
    expect(guard.supabaseProjectRef(prodUrl)).toBe(PROD_REF)
  })

  test('accepts the .in domain as well as .co', () => {
    expect(guard.supabaseProjectRef(`https://${PROD_REF}.supabase.in`)).toBe(PROD_REF)
  })

  test('returns null for a non-Supabase or malformed URL', () => {
    expect(guard.supabaseProjectRef('https://example.com')).toBeNull()
    expect(guard.supabaseProjectRef('not a url')).toBeNull()
    expect(guard.supabaseProjectRef('')).toBeNull()
    expect(guard.supabaseProjectRef(undefined)).toBeNull()
    expect(guard.supabaseProjectRef(null)).toBeNull()
  })
})

describe('decideWriteAllowed — production', () => {
  test('allows production even when the URL is not a staging project', () => {
    expect(
      guard.decideWriteAllowed({ vercelEnv: 'production', supabaseUrl: prodUrl, stagingProjectRef: STAGE_REF })
    ).toEqual({ allowed: true, reason: 'production' })
  })

  test('allows production with no staging ref declared', () => {
    expect(
      guard.decideWriteAllowed({ vercelEnv: 'production', supabaseUrl: prodUrl, stagingProjectRef: undefined }).allowed
    ).toBe(true)
  })
})

describe('decideWriteAllowed — not on Vercel', () => {
  test('allows when VERCEL_ENV is unset', () => {
    expect(
      guard.decideWriteAllowed({ vercelEnv: undefined, supabaseUrl: prodUrl, stagingProjectRef: undefined }).allowed
    ).toBe(true)
  })

  test('allows when VERCEL_ENV is an empty string', () => {
    expect(
      guard.decideWriteAllowed({ vercelEnv: '', supabaseUrl: prodUrl, stagingProjectRef: undefined }).allowed
    ).toBe(true)
  })
})

describe('decideWriteAllowed — preview and other non-production environments', () => {
  // The exact defect: a preview deployment holding production credentials.
  test('DENIES a preview deployment pointing at production', () => {
    const d = guard.decideWriteAllowed({ vercelEnv: 'preview', supabaseUrl: prodUrl, stagingProjectRef: STAGE_REF })
    expect(d.allowed).toBe(false)
    expect(d.reason).toContain(PROD_REF)
    expect(d.reason).toContain(STAGE_REF)
  })

  test('denies a preview deployment when no staging database is declared', () => {
    const d = guard.decideWriteAllowed({ vercelEnv: 'preview', supabaseUrl: stageUrl, stagingProjectRef: undefined })
    expect(d.allowed).toBe(false)
    expect(d.reason).toContain('no staging database is declared')
  })

  test('denies when the Supabase URL does not identify a project', () => {
    const d = guard.decideWriteAllowed({ vercelEnv: 'preview', supabaseUrl: 'https://example.com', stagingProjectRef: STAGE_REF })
    expect(d.allowed).toBe(false)
    expect(d.reason).toContain('does not identify')
  })

  test('denies when the Supabase URL is missing entirely', () => {
    expect(
      guard.decideWriteAllowed({ vercelEnv: 'preview', supabaseUrl: undefined, stagingProjectRef: STAGE_REF }).allowed
    ).toBe(false)
  })

  test('allows a preview deployment only when it points at the declared staging project', () => {
    expect(
      guard.decideWriteAllowed({ vercelEnv: 'preview', supabaseUrl: stageUrl, stagingProjectRef: STAGE_REF })
    ).toEqual({ allowed: true, reason: 'declared staging database' })
  })

  test('applies the same rule to any other non-production VERCEL_ENV value', () => {
    expect(
      guard.decideWriteAllowed({ vercelEnv: 'development', supabaseUrl: prodUrl, stagingProjectRef: STAGE_REF }).allowed
    ).toBe(false)
  })
})

describe('blockedWrite — request gating', () => {
  const previewProd = { VERCEL_ENV: 'preview', NEXT_PUBLIC_SUPABASE_URL: prodUrl, STAGING_SUPABASE_PROJECT_REF: STAGE_REF }
  const previewStage = { VERCEL_ENV: 'preview', NEXT_PUBLIC_SUPABASE_URL: stageUrl, STAGING_SUPABASE_PROJECT_REF: STAGE_REF }
  const production = { VERCEL_ENV: 'production', NEXT_PUBLIC_SUPABASE_URL: prodUrl }

  test('blocks a POST from a preview deployment holding production credentials', () => {
    const r = guard.blockedWrite({ method: 'POST' }, previewProd)
    expect(r).not.toBeNull()
    expect(r.status).toBe(503)
    expect(r.body.error).toMatch(/refused/i)
  })

  test('blocks PUT, PATCH and DELETE as well as POST', () => {
    for (const method of ['PUT', 'PATCH', 'DELETE']) {
      expect(guard.blockedWrite({ method }, previewProd)).not.toBeNull()
    }
  })

  test('does not block read methods', () => {
    for (const method of ['GET', 'HEAD', 'OPTIONS']) {
      expect(guard.blockedWrite({ method }, previewProd)).toBeNull()
    }
  })

  test('allows a write from production', () => {
    expect(guard.blockedWrite({ method: 'POST' }, production)).toBeNull()
  })

  test('allows a write from a preview deployment pointed at the staging project', () => {
    expect(guard.blockedWrite({ method: 'POST' }, previewStage)).toBeNull()
  })

  test('allows a write when not on Vercel at all', () => {
    expect(guard.blockedWrite({ method: 'POST' }, { NEXT_PUBLIC_SUPABASE_URL: prodUrl })).toBeNull()
  })
})

describe('blockedWrite — GET handlers that write', () => {
  // Six route handlers write inside their GET handler, so a method check alone
  // would let those through on a preview deployment.
  const previewProd = { VERCEL_ENV: 'preview', NEXT_PUBLIC_SUPABASE_URL: prodUrl, STAGING_SUPABASE_PROJECT_REF: STAGE_REF }
  const req = pathname => ({ method: 'GET', nextUrl: { pathname } })

  test.each(guard.GET_WRITE_PATHS)('blocks GET %s on a preview deployment', pathname => {
    const r = guard.blockedWrite(req(pathname), previewProd)
    expect(r).not.toBeNull()
    expect(r.status).toBe(503)
  })

  test('does not block a read-only GET on a preview deployment', () => {
    expect(guard.blockedWrite(req('/api/health'), previewProd)).toBeNull()
    expect(guard.blockedWrite(req('/marketplace'), previewProd)).toBeNull()
  })

  test('allows a writing GET from production', () => {
    expect(
      guard.blockedWrite(req('/api/cron/valu-reminders'), { VERCEL_ENV: 'production', NEXT_PUBLIC_SUPABASE_URL: prodUrl })
    ).toBeNull()
  })

  test('the path list matches the routes that actually write in their GET handler', () => {
    // Guards against a new writing GET route being added without listing it.
    // The handler body is brace-matched, so a write in a PATCH handler defined
    // after GET is not mistaken for a GET write.
    const apiDir = path.join(root, 'src/app/api')
    const walk = dir =>
      fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => {
        const full = path.join(dir, e.name)
        return e.isDirectory() ? walk(full) : full.endsWith('route.js') ? [full] : []
      })

    const handlerBody = (src, name) => {
      const m = src.match(new RegExp(`export\\s+async\\s+function\\s+${name}\\s*\\(`))
      if (!m) return null
      let i = src.indexOf('{', m.index + m[0].length - 1)
      let depth = 0
      for (let j = i; j < src.length; j += 1) {
        if (src[j] === '{') depth += 1
        else if (src[j] === '}') {
          depth -= 1
          if (depth === 0) return src.slice(i, j + 1)
        }
      }
      return null
    }

    const writingGets = walk(apiDir).filter(file => {
      const body = handlerBody(fs.readFileSync(file, 'utf8'), 'GET')
      return body !== null && /\.(insert|update|upsert|delete)\(/.test(body)
    })

    const fromFiles = writingGets
      .map(f => '/api/' + path.relative(apiDir, f).replace(/\/route\.js$/, '').split(path.sep).join('/'))
      .sort()
    // /journey/continue lives outside src/app/api but is covered by the same list.
    const declared = guard.GET_WRITE_PATHS.filter(p => p.startsWith('/api/')).sort()
    expect(declared).toEqual(fromFiles)
  })
})

describe('middleware enforces the guard before the /api bypass', () => {
  const src = read('src/middleware.js')

  test('imports the guard', () => {
    expect(src).toContain("from './lib/environment-guard.js'")
  })

  test('calls blockedWrite', () => {
    expect(src).toMatch(/blockedWrite\(request\)/)
  })

  test('the guard runs before shouldBypassAuth, so /api is covered', () => {
    const guardAt = src.indexOf('blockedWrite(request)')
    const bypassAt = src.indexOf('shouldBypassAuth(pathname)')
    expect(guardAt).toBeGreaterThan(-1)
    expect(bypassAt).toBeGreaterThan(-1)
    expect(guardAt).toBeLessThan(bypassAt)
  })
})
