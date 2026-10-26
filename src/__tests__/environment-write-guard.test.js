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
// The first version of this guard allowed any write when VERCEL_ENV was unset,
// reasoning that Vercel always sets it. That was itself a hole: a deployment whose
// VERCEL_ENV failed to propagate, or any runtime Vercel does not manage, would have
// been treated as local development and allowed to write with production
// credentials. Nothing is allowed by default now - the runtime and the target
// project must both be positively identified.
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

describe('decideWriteAllowed - production', () => {
  test('allows production only when the target is the declared production project', () => {
    expect(
      guard.decideWriteAllowed({
        vercelEnv: 'production',
        supabaseUrl: prodUrl,
        productionProjectRef: PROD_REF,
      })
    ).toEqual({ allowed: true, reason: 'production' })
  })

  test('DENIES production when no production project is declared', () => {
    const d = guard.decideWriteAllowed({
      vercelEnv: 'production',
      supabaseUrl: prodUrl,
      productionProjectRef: undefined,
    })
    expect(d.allowed).toBe(false)
    expect(d.reason).toContain('PRODUCTION_SUPABASE_PROJECT_REF')
  })

  test('DENIES production when the target is a different project', () => {
    const d = guard.decideWriteAllowed({
      vercelEnv: 'production',
      supabaseUrl: stageUrl,
      productionProjectRef: PROD_REF,
    })
    expect(d.allowed).toBe(false)
    expect(d.reason).toContain(STAGE_REF)
    expect(d.reason).toContain(PROD_REF)
  })

  test('DENIES production when the Supabase URL is unreadable', () => {
    expect(
      guard.decideWriteAllowed({
        vercelEnv: 'production',
        supabaseUrl: 'https://example.com',
        productionProjectRef: PROD_REF,
      }).allowed
    ).toBe(false)
  })

  test('does not let a staging declaration authorise a production write', () => {
    expect(
      guard.decideWriteAllowed({
        vercelEnv: 'production',
        supabaseUrl: prodUrl,
        stagingProjectRef: PROD_REF,
      }).allowed
    ).toBe(false)
  })
})

describe('decideWriteAllowed - VERCEL_ENV unset or empty (unidentified runtime)', () => {
  // The second defect. An absent environment is not evidence of local
  // development; it is absence of evidence, and it must not permit a write.

  test('DENIES when VERCEL_ENV is unset, with no opt-in', () => {
    const d = guard.decideWriteAllowed({
      vercelEnv: undefined,
      supabaseUrl: prodUrl,
      stagingProjectRef: STAGE_REF,
    })
    expect(d.allowed).toBe(false)
    expect(d.reason).toContain('ALLOW_LOCAL_PRIVILEGED_WRITES')
  })

  test('DENIES when VERCEL_ENV is an empty string, with no opt-in', () => {
    expect(
      guard.decideWriteAllowed({
        vercelEnv: '',
        supabaseUrl: prodUrl,
        stagingProjectRef: STAGE_REF,
      }).allowed
    ).toBe(false)
  })

  test('DENIES an unset environment that points at production, even WITH the opt-in', () => {
    // The opt-in enables local development; it does not authorise production.
    const d = guard.decideWriteAllowed({
      vercelEnv: undefined,
      supabaseUrl: prodUrl,
      stagingProjectRef: STAGE_REF,
      allowLocalWrites: true,
    })
    expect(d.allowed).toBe(false)
    expect(d.reason).toContain(PROD_REF)
  })

  test('DENIES an unset environment with the opt-in but no declared project', () => {
    expect(
      guard.decideWriteAllowed({
        vercelEnv: undefined,
        supabaseUrl: stageUrl,
        stagingProjectRef: undefined,
        allowLocalWrites: true,
      }).allowed
    ).toBe(false)
  })

  test('allows local development only when opted in AND the target is the declared project', () => {
    expect(
      guard.decideWriteAllowed({
        vercelEnv: undefined,
        supabaseUrl: stageUrl,
        stagingProjectRef: STAGE_REF,
        allowLocalWrites: true,
      })
    ).toEqual({ allowed: true, reason: 'local development against the declared staging database' })
  })

  test('the opt-in must be exactly true, not merely truthy', () => {
    for (const value of ['true', 1, 'yes', {}]) {
      expect(
        guard.decideWriteAllowed({
          vercelEnv: undefined,
          supabaseUrl: stageUrl,
          stagingProjectRef: STAGE_REF,
          allowLocalWrites: value,
        }).allowed
      ).toBe(false)
    }
  })
})

describe('decideWriteAllowed - preview and other non-production environments', () => {
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

  test('applies the same rule to development and to any unexpected VERCEL_ENV value', () => {
    // A value nobody anticipated must be treated like preview, not like production.
    for (const vercelEnv of ['development', 'staging', 'test', 'PREVIEW', 'prod', '0']) {
      expect(
        guard.decideWriteAllowed({ vercelEnv, supabaseUrl: prodUrl, stagingProjectRef: STAGE_REF }).allowed
      ).toBe(false)
      expect(
        guard.decideWriteAllowed({ vercelEnv, supabaseUrl: stageUrl, stagingProjectRef: STAGE_REF }).allowed
      ).toBe(true)
    }
  })

  test('a preview cannot reach production by leaving the staging ref unset', () => {
    // The misconfiguration case: preview + production credentials + nothing declared.
    expect(guard.decideWriteAllowed({ vercelEnv: 'preview', supabaseUrl: prodUrl }).allowed).toBe(false)
  })
})

describe('cannot be bypassed by a lookalike or malformed target', () => {
  // The ref is read from the URL host. A host that merely *contains* the ref, or
  // nests it under another domain, must not be accepted: the point of the check
  // is to pin the exact project, and a substring match would not.
  const LOOKALIKES = [
    `https://${PROD_REF}.supabase.co.evil.example`,
    `https://evil.example/${PROD_REF}.supabase.co`,
    `https://evil-${PROD_REF}.supabase.co`,
    `https://x${PROD_REF}.supabase.co`,
    `https://${PROD_REF}.pooler.supabase.com`,
    `https://${PROD_REF}.supabase.example.com`,
    `https://sub.${PROD_REF}.supabase.co`,
  ]

  test.each(LOOKALIKES)('reads no project ref from %s', url => {
    expect(guard.supabaseProjectRef(url)).toBeNull()
  })

  test.each(LOOKALIKES)('DENIES production pointed at %s', url => {
    expect(
      guard.decideWriteAllowed({ vercelEnv: 'production', supabaseUrl: url, productionProjectRef: PROD_REF }).allowed
    ).toBe(false)
  })

  test.each(LOOKALIKES)('DENIES a preview pointed at %s', url => {
    expect(
      guard.decideWriteAllowed({ vercelEnv: 'preview', supabaseUrl: url, stagingProjectRef: STAGE_REF }).allowed
    ).toBe(false)
  })

  test('accepts a ref host with a trailing slash, path or port', () => {
    for (const url of [
      `https://${PROD_REF}.supabase.co/`,
      `https://${PROD_REF}.supabase.co/rest/v1/valu_assessments`,
      `https://${PROD_REF}.supabase.co:8443`,
    ]) {
      expect(guard.supabaseProjectRef(url)).toBe(PROD_REF)
    }
  })
})

describe('cannot be bypassed by environment casing or whitespace', () => {
  // VERCEL_ENV is compared exactly. Anything that is not exactly "production" is
  // treated as a non-production runtime, which is the fail-closed direction.
  const NOT_PRODUCTION = ['PRODUCTION', 'Production', 'production ', ' production', 'production\n', 'production\t', 'productionx']

  test.each(NOT_PRODUCTION)('treats %j as non-production, not as production', value => {
    expect(
      guard.decideWriteAllowed({
        vercelEnv: value,
        supabaseUrl: prodUrl,
        productionProjectRef: PROD_REF,
        stagingProjectRef: STAGE_REF,
      }).allowed
    ).toBe(false)
  })

  test('a non-production runtime cannot reach production by declaring the production ref as staging', () => {
    // The misconfiguration this closes: a misspelled or unexpected VERCEL_ENV plus
    // a staging declaration that names the production project.
    for (const vercelEnv of ['PRODUCTION', 'preview', 'development', 'staging']) {
      const d = guard.decideWriteAllowed({
        vercelEnv,
        supabaseUrl: prodUrl,
        productionProjectRef: PROD_REF,
        stagingProjectRef: PROD_REF,
      })
      expect(d.allowed).toBe(false)
      expect(d.reason).toMatch(/names the production project/)
    }
  })
})

describe('a declared ref is normalised, a target never is', () => {
  // The declaration is operator-managed, so a copy-paste slip must not lock a
  // deployment out of its own database. Normalising it cannot widen access,
  // because it only ever maps a declaration onto the same project.

  test('accepts an uppercased or padded production declaration', () => {
    for (const declared of [PROD_REF.toUpperCase(), `  ${PROD_REF}  `, `${PROD_REF}\n`]) {
      expect(
        guard.decideWriteAllowed({ vercelEnv: 'production', supabaseUrl: prodUrl, productionProjectRef: declared }).allowed
      ).toBe(true)
    }
  })

  test('accepts an uppercased or padded staging declaration', () => {
    for (const declared of [STAGE_REF.toUpperCase(), ` ${STAGE_REF} `]) {
      expect(
        guard.decideWriteAllowed({ vercelEnv: 'preview', supabaseUrl: stageUrl, stagingProjectRef: declared }).allowed
      ).toBe(true)
    }
  })

  test('normalising a declaration never lets a different project through', () => {
    expect(
      guard.decideWriteAllowed({
        vercelEnv: 'preview',
        supabaseUrl: prodUrl,
        stagingProjectRef: STAGE_REF.toUpperCase(),
      }).allowed
    ).toBe(false)
  })

  test('a declaration that normalises to empty is treated as absent', () => {
    for (const declared of ['', '   ', '\n']) {
      const d = guard.decideWriteAllowed({ vercelEnv: 'preview', supabaseUrl: stageUrl, stagingProjectRef: declared })
      expect(d.allowed).toBe(false)
      expect(d.reason).toContain('no staging database is declared')
    }
  })
})

describe('the middleware matcher actually reaches every writer', () => {
  // The site guards centrally: middleware calls blockedWrite, and it runs before
  // the /api bypass. That is only sound if the matcher covers every route that can
  // write. A route excluded from the matcher is an unguarded writer, and the
  // exclusion is easy to widen by accident.
  const root = path.join(__dirname, '..', '..')
  const middleware = fs.readFileSync(path.join(root, 'src', 'middleware.js'), 'utf8')
  const matcherMatch = middleware.match(/matcher:\s*\[\s*'([^']+)'\s*\]/)
  const matcher = matcherMatch[1]

  test('the matcher excludes only static assets and the proxied assessment app', () => {
    // Anything else in this list silently removes a route from the guard.
    for (const excluded of ['_next/static', '_next/image', 'favicon.ico', 'valu/assessment']) {
      expect(matcher).toContain(excluded)
    }
  })

  test('no api route is excluded by the matcher', () => {
    const apiDir = path.join(root, 'src', 'app', 'api')
    const routes = []
    ;(function walk(dir) {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name)
        if (entry.isDirectory()) walk(full)
        else if (entry.name === 'route.js') routes.push(path.relative(apiDir, full))
      }
    })(apiDir)
    expect(routes.length).toBeGreaterThan(20)
    // The negative lookahead must not name api, or the whole /api surface drops out.
    expect(matcher).not.toMatch(/\bapi\b/)
  })

  test('the middleware calls blockedWrite before the auth bypass', () => {
    const guardIndex = middleware.indexOf('blockedWrite(request)')
    const bypassIndex = middleware.indexOf('shouldBypassAuth(pathname)')
    expect(guardIndex).toBeGreaterThan(-1)
    expect(bypassIndex).toBeGreaterThan(-1)
    expect(guardIndex).toBeLessThan(bypassIndex)
  })
})

describe('blockedWrite - request gating', () => {
  const previewProd = {
    VERCEL_ENV: 'preview',
    NEXT_PUBLIC_SUPABASE_URL: prodUrl,
    STAGING_SUPABASE_PROJECT_REF: STAGE_REF,
  }
  const previewStage = {
    VERCEL_ENV: 'preview',
    NEXT_PUBLIC_SUPABASE_URL: stageUrl,
    STAGING_SUPABASE_PROJECT_REF: STAGE_REF,
  }
  const production = {
    VERCEL_ENV: 'production',
    NEXT_PUBLIC_SUPABASE_URL: prodUrl,
    PRODUCTION_SUPABASE_PROJECT_REF: PROD_REF,
  }

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

  test('allows a write from production when the production project is declared', () => {
    expect(guard.blockedWrite({ method: 'POST' }, production)).toBeNull()
  })

  test('allows a write from a preview deployment pointed at the staging project', () => {
    expect(guard.blockedWrite({ method: 'POST' }, previewStage)).toBeNull()
  })

  test('BLOCKS a write from an unidentified runtime with no opt-in', () => {
    // This used to be allowed. A deployment whose VERCEL_ENV failed to propagate
    // must not write with production credentials.
    const r = guard.blockedWrite({ method: 'POST' }, { NEXT_PUBLIC_SUPABASE_URL: prodUrl })
    expect(r).not.toBeNull()
    expect(r.status).toBe(503)
  })

  test('allows a write from local development only with the explicit opt-in and a declared target', () => {
    expect(
      guard.blockedWrite(
        { method: 'POST' },
        {
          NEXT_PUBLIC_SUPABASE_URL: stageUrl,
          STAGING_SUPABASE_PROJECT_REF: STAGE_REF,
          ALLOW_LOCAL_PRIVILEGED_WRITES: 'true',
        }
      )
    ).toBeNull()
  })

  test('the opt-in variable must be exactly the string true', () => {
    // blockedWrite parses the variable; the pure function is not the only place a
    // truthy value could slip through. '1', 'yes' and 'TRUE' must not count.
    for (const value of ['1', 'yes', 'TRUE', 'on', ' true']) {
      const r = guard.blockedWrite(
        { method: 'POST' },
        {
          NEXT_PUBLIC_SUPABASE_URL: stageUrl,
          STAGING_SUPABASE_PROJECT_REF: STAGE_REF,
          ALLOW_LOCAL_PRIVILEGED_WRITES: value,
        }
      )
      expect(r).not.toBeNull()
      expect(r.status).toBe(503)
    }
  })

  test('the opt-in alone is not enough: local development pointed at production is blocked', () => {
    const r = guard.blockedWrite(
      { method: 'POST' },
      {
        NEXT_PUBLIC_SUPABASE_URL: prodUrl,
        STAGING_SUPABASE_PROJECT_REF: STAGE_REF,
        ALLOW_LOCAL_PRIVILEGED_WRITES: 'true',
      }
    )
    expect(r).not.toBeNull()
    expect(r.body.detail).toContain(PROD_REF)
  })
})

describe('blockedWrite - GET handlers that write', () => {
  // Six route handlers write inside their GET handler, so a method check alone
  // would let those through on a preview deployment.
  const previewProd = {
    VERCEL_ENV: 'preview',
    NEXT_PUBLIC_SUPABASE_URL: prodUrl,
    STAGING_SUPABASE_PROJECT_REF: STAGE_REF,
  }
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

  test('allows a writing GET from production when the production project is declared', () => {
    expect(
      guard.blockedWrite(req('/api/cron/valu-reminders'), {
        VERCEL_ENV: 'production',
        NEXT_PUBLIC_SUPABASE_URL: prodUrl,
        PRODUCTION_SUPABASE_PROJECT_REF: PROD_REF,
      })
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
      const i = src.indexOf('{', m.index + m[0].length - 1)
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
