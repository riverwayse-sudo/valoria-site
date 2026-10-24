// src/__tests__/remediation-regressions.test.js
//
// Regression coverage for the staging remediation of the 23 October 2026
// valoria-site audit. Each test pins a defect that was confirmed in source and
// repaired, so the fix cannot silently regress. These are static/contract
// assertions plus real unit tests of the new pure helpers — no mocks.

const fs = require('fs')
const path = require('path')

const root = process.cwd()
const read = file => fs.readFileSync(path.join(root, file), 'utf8')

// ── 1. Environment-specific auth redirects ────────────────────────────────
describe('auth redirects are environment-specific, never hardcoded production hosts', () => {
  test('site-url helper resolves from NEXT_PUBLIC_SITE_URL, then origin, then production', () => {
    const previous = process.env.NEXT_PUBLIC_SITE_URL
    try {
      // Explicit environment configuration wins.
      process.env.NEXT_PUBLIC_SITE_URL = 'https://staging.valoria.example'
      jest.resetModules()
      let mod = require('../lib/site-url')
      expect(mod.getSiteOrigin()).toBe('https://staging.valoria.example')
      expect(mod.authCallbackUrl()).toBe('https://staging.valoria.example/auth/callback')
      expect(mod.passwordResetUrl()).toBe('https://staging.valoria.example/reset-password')

      // Trailing paths/slashes are normalised to an origin.
      process.env.NEXT_PUBLIC_SITE_URL = 'https://staging.valoria.example/some/path'
      jest.resetModules()
      mod = require('../lib/site-url')
      expect(mod.getSiteOrigin()).toBe('https://staging.valoria.example')

      // Unconfigured falls back to the production origin (no browser origin in node).
      delete process.env.NEXT_PUBLIC_SITE_URL
      jest.resetModules()
      mod = require('../lib/site-url')
      expect(mod.getSiteOrigin()).toBe(mod.PRODUCTION_SITE_URL)
    } finally {
      if (previous === undefined) delete process.env.NEXT_PUBLIC_SITE_URL
      else process.env.NEXT_PUBLIC_SITE_URL = previous
      jest.resetModules()
    }
  })

  test('authCallbackUrl carries the pending snapshot handoff without encoding bugs', () => {
    const previous = process.env.NEXT_PUBLIC_SITE_URL
    try {
      process.env.NEXT_PUBLIC_SITE_URL = 'https://staging.valoria.example'
      jest.resetModules()
      const { authCallbackUrl } = require('../lib/site-url')
      const url = new URL(authCallbackUrl({ pending_taster_id: 'abc-123' }))
      expect(url.origin).toBe('https://staging.valoria.example')
      expect(url.pathname).toBe('/auth/callback')
      expect(url.searchParams.get('pending_taster_id')).toBe('abc-123')
      // Blank/undefined params are dropped rather than emitted as `key=`.
      expect(new URL(authCallbackUrl({ pending_taster_id: '' })).search).toBe('')
    } finally {
      if (previous === undefined) delete process.env.NEXT_PUBLIC_SITE_URL
      else process.env.NEXT_PUBLIC_SITE_URL = previous
      jest.resetModules()
    }
  })

  test('no client auth flow hardcodes the production callback or recovery host', () => {
    const signup = read('src/app/signup/page.jsx')
    const professional = read('src/app/professional-signup/page.jsx')
    const login = read('src/app/login/page.jsx')
    for (const source of [signup, professional]) {
      expect(source).not.toContain("emailRedirectTo: 'https://valoriainstitute.com/auth/callback'")
      expect(source).not.toContain('emailRedirectTo:`https://valoriainstitute.com/auth/callback')
      expect(source).toContain('authCallbackUrl')
    }
    expect(login).not.toContain("'https://valoriainstitute.com/reset-password'")
    expect(login).toContain('passwordResetUrl()')
  })

  test('the assessment proxy upstream is environment-configurable, not hardcoded', () => {
    const trigger = read('src/app/api/trigger-report/route.js')
    expect(trigger).toContain('process.env.VALU_UPSTREAM_ORIGIN')
    expect(read('next.config.js')).toContain('process.env.VALU_UPSTREAM_ORIGIN')
  })

  test('no participant- or staff-routing link hardcodes the production origin', () => {
    // SEO canonicals, the sitemap and OpenGraph URLs legitimately name the
    // production domain and are excluded by scanning only href/src attributes
    // and navigation calls. A routing link built from the literal sends a
    // staging participant (or the enquiries notification) to production.
    const files = [
      'src/app/api/enquiries/route.js',
      'src/app/profile/setup/page.jsx',
      'src/app/profile/[id]/ProfileClient.jsx',
    ]
    const offenders = []
    for (const file of files) {
      const source = read(file)
      const pattern = /(href=|router\.(?:push|replace)\(|location\.(?:href|assign)=)\s*[^\n]*?["'`]https:\/\/valoriainstitute\.com/g
      for (const m of source.match(pattern) || []) offenders.push(`${file}: ${m}`)
    }
    expect(offenders).toEqual([])
  })

  test('those links route through the shared siteUrl helper', () => {
    expect(read('src/app/api/enquiries/route.js')).toContain("siteUrl('/admin')")
    expect(read('src/app/api/enquiries/route.js')).toContain('siteUrl(actionUrl)')
    expect(read('src/app/profile/setup/page.jsx')).toContain("siteUrl('/valu/assessment/')")
    expect(read('src/app/profile/[id]/ProfileClient.jsx')).toContain("siteUrl('/valu/assessment/')")
  })
})

// ── 2. Registration / authentication handoff ──────────────────────────────
describe('registration and confirmation handoff', () => {
  test('the auth callback exchanges the code, requires a verified user, and lands on the dashboard', () => {
    const callback = read('src/app/auth/callback/page.jsx')
    expect(callback).toContain('exchangeCodeForSession')
    expect(callback).toContain('supabase.auth.getUser()')
    expect(callback).toContain("router.replace('/dashboard?welcome=profile')")
    // A failed confirmation must surface a recoverable error, not a blank page.
    expect(callback).toContain('setFailed(true)')
  })

  test('pending snapshot identity survives the confirmation round trip', () => {
    const callback = read('src/app/auth/callback/page.jsx')
    expect(callback).toContain("params.get('pending_taster_id')")
    expect(callback).toContain("localStorage.getItem('pending_taster_id')")
    expect(callback).toContain('/api/link-taster')
  })

  test('professional signup keeps the pending taster id for the confirmation handoff', () => {
    const source = read('src/app/professional-signup/page.jsx')
    expect(source).toContain("localStorage.setItem('pending_taster_id',tasterId)")
    expect(source).toContain('authCallbackUrl({pending_taster_id:tasterId})')
  })
})

// ── 3. Dashboard outstanding-action states ────────────────────────────────
describe('dashboard exposes each outstanding action independently', () => {
  const dashboard = read('src/app/dashboard/page.jsx')

  test('an in-progress assessment is detected from the resumable session, not the completed record', () => {
    expect(dashboard).toContain("from('assessment_sessions')")
    expect(dashboard).toContain(".is('completed_at', null)")
    expect(dashboard).toContain('setAssessmentInProgress')
  })

  test('the VALU card offers a resume action distinct from starting the assessment', () => {
    expect(dashboard).toContain('RESUME YOUR ASSESSMENT')
    expect(dashboard).toContain('assessmentInProgress &&')
    expect(dashboard).toContain('TAKE THE ASSESSMENT')
  })

  test('VALU score, designation and clusters read from the authoritative assessment record', () => {
    expect(dashboard).toContain('const valuScore         = assessment?.total_score ?? p.valu_index ?? null')
    expect(dashboard).toContain('const valuDesignation   = assessment?.designation ?? p.designation ?? null')
    expect(dashboard).toContain('const valuClusterScores = p.cluster_scores || assessment?.cluster_scores || null')
    // The assessment query must actually request the cluster scores it now uses.
    expect(dashboard).toContain("'completed_at,total_score,designation,cluster_scores,valu_index:total_score'")
  })
})

// ── 4. Privileged Supabase access is fail-closed ──────────────────────────
describe('privileged server routes fail closed instead of downgrading to the anon key', () => {
  const privilegedRoutes = [
    'src/app/api/health/route.js',
    'src/app/api/waitlist/stats/route.js',
    'src/app/api/cv-summary/route.js',
    'src/app/api/enquiries/route.js',
    'src/app/api/feedback/route.js',
    'src/components/LiveProfilesScroll.jsx',
  ]

  test.each(privilegedRoutes)('%s no longer falls back to the anonymous key', file => {
    const source = read(file)
    expect(source).not.toContain('SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY')
    expect(source).not.toContain('SUPABASE_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY')
  })

  test('the privileged client helper throws when the service-role key is absent', () => {
    const previous = process.env.SUPABASE_SERVICE_ROLE_KEY
    const previousUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    try {
      delete process.env.SUPABASE_SERVICE_ROLE_KEY
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
      jest.resetModules()
      const { getPrivilegedClient, hasPrivilegedCredentials } = require('../lib/supabase-server')
      expect(hasPrivilegedCredentials()).toBe(false)
      expect(() => getPrivilegedClient()).toThrow(/not configured/i)

      process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-test-key'
      jest.resetModules()
      const ready = require('../lib/supabase-server')
      expect(ready.hasPrivilegedCredentials()).toBe(true)
      expect(() => ready.getPrivilegedClient()).not.toThrow()
    } finally {
      if (previous === undefined) delete process.env.SUPABASE_SERVICE_ROLE_KEY
      else process.env.SUPABASE_SERVICE_ROLE_KEY = previous
      if (previousUrl === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL
      else process.env.NEXT_PUBLIC_SUPABASE_URL = previousUrl
      jest.resetModules()
    }
  })
})

// ── 5. Careers funnel integrity ───────────────────────────────────────────
describe('careers application funnel', () => {
  test('CV validation enforces type, extension and 4 MB size on both client and server', () => {
    const form = read('src/app/careers/CareerApplicationForm.jsx')
    const route = read('src/app/api/careers/applications/route.js')
    expect(form).toContain('4*1024*1024')
    expect(route).toContain('MAX_CV_BYTES=4*1024*1024')
    // Magic-number validation stops a renamed arbitrary file being stored as a CV.
    expect(route).toContain("'%PDF-'")
    expect(route).toContain('0x50,0x4B,0x03,0x04')
  })

  test('notification routing targets the approved careers address and is non-blocking', () => {
    const route = read('src/app/api/careers/applications/route.js')
    expect(route).toContain("email:'career@valoriainstitute.com'")
    // The row is the system of record; a mail failure must not lose it.
    expect(route).toContain('Email is a notification channel, not the system of record')
  })

  test('duplicate applications are rejected without leaking an internal error', () => {
    const route = read('src/app/api/careers/applications/route.js')
    expect(route).toContain("status:409")
    expect(route).toContain("from('career_applications').select('id')")
  })
})

// ── 6. Score / tier contract preserved ────────────────────────────────────
describe('canonical scoring and points display are preserved', () => {
  test('VALU scores are displayed as points out of 100, not percentages', () => {
    const brand = read('src/lib/brand.js')
    expect(brand).toContain("unit: 'points'")
    expect(brand).toContain('maximum: 100')
    expect(brand).toContain("displaySuffix: '/100'")
  })

  test('a taster/basic listing never receives an official index or merit tier', () => {
    const brand = read('src/lib/brand.js')
    // getValuTier returns null for anything that is not a full assessment.
    expect(brand).toContain("if (assessmentLevel !== 'full'")
    expect(brand).toContain('return null')
  })

  test('the scoring engine still exposes the canonical cluster weights', () => {
    const { CLUSTERS, computeWeightedIndex } = require('../scoringEngine')
    expect(CLUSTERS.reduce((s, c) => s + c.weight, 0)).toBeCloseTo(1.0, 5)
    expect(computeWeightedIndex({ P: 100, R: 100, I: 100, M: 100, E: 100 })).toBe(100)
  })
})

// ── 7. Assessment asset loading (priority #1) ─────────────────────────────
describe('proxied VALU assessment assets are never gated by site middleware', () => {
  // Root cause: the middleware matcher excludes only _next/static and
  // _next/image, so /valu/assessment/assets/*.js and *.css reached the
  // middleware; the static-extension allowlist did not include js/css, so the
  // assets fell through to an unguarded supabase.auth.getUser() call and any
  // auth/network failure returned 500 — the SPA shell rendered but looked
  // broken. The middleware must bypass the whole prefix and must not let an
  // auth error throw.
  const middleware = read('src/middleware.js')
  const routingSource = read('src/lib/middleware-routing.js')

  test('the whole /valu/assessment prefix is bypassed before any auth call', () => {
    // The bypass decision now lives in src/lib/middleware-routing.js (extracted
    // so it is unit-testable — see resilience-regressions.test.js for the
    // behavioural coverage). middleware.js must delegate to it before touching
    // Supabase.
    expect(routingSource).toMatch(/pathname\s*===\s*ASSESSMENT_PREFIX/)
    expect(routingSource).toMatch(/pathname\.startsWith\(ASSESSMENT_PREFIX \+ '\/'\)/)
    const code = middleware.replace(/\/\/[^\n]*/g, '')
    const bypassAt = code.indexOf('shouldBypassAuth(pathname)')
    const authAt = code.indexOf('supabase.auth.getUser()')
    expect(bypassAt).toBeGreaterThan(-1)
    expect(authAt).toBeGreaterThan(-1)
    expect(bypassAt).toBeLessThan(authAt)
  })

  test('the static-asset allowlist covers the SPA bundle types (js, css, mjs, map)', () => {
    const allowlist = routingSource.match(/const STATIC_ASSET = (\/.*\/)$/m)
    expect(allowlist).not.toBeNull()
    for (const ext of ['js', 'mjs', 'css', 'map', 'json', 'woff2']) {
      expect(allowlist[1]).toContain(ext)
    }
  })

  test('a failed identity lookup degrades instead of throwing a site-wide 500', () => {
    expect(middleware).toMatch(/try\s*{[\s\S]*supabase\.auth\.getUser\(\)[\s\S]*}\s*catch/)
    // Must not `return response` early on failure — that would skip the admin
    // guard below. Failure has to fail closed by leaving user null.
    expect(middleware).not.toMatch(/catch\s*{\s*return response\s*}/)
  })
})

// ── 8. Confirmed-email success state (#127) ───────────────────────────────
describe('login shows an accessible success notice after email confirmation', () => {
  const login = read('src/app/login/page.jsx')

  test('the email_confirmed flag from the confirmation redirect is honoured', () => {
    expect(login).toMatch(/params\.has\('email_confirmed'\)/)
    expect(login).toContain('setEmailConfirmed(true)')
  })

  test('the notice is announced to assistive tech and names the next step', () => {
    expect(login).toContain('emailConfirmed &&')
    expect(login).toMatch(/role="status"[\s\S]{0,80}aria-live="polite"/)
    expect(login).toContain('Your email address is verified')
  })
})

// ── 9. Dashboard exposes both outstanding actions (#129) ──────────────────
describe('dashboard surfaces assessment and profile tasks independently', () => {
  const dashboard = read('src/app/dashboard/page.jsx')

  test('both outstanding actions are rendered as separate entries', () => {
    expect(dashboard).toContain("key: 'assessment'")
    expect(dashboard).toContain("key: 'profile'")
    // Both are pushed into the same list, so completing one cannot hide the other.
    expect(dashboard).toMatch(/if\s*\(!assessmentDone\)[\s\S]{0,400}outstanding\.push/)
    expect(dashboard).toMatch(/if\s*\(!profileComplete\)[\s\S]{0,400}outstanding\.push/)
  })

  test('the assessment action is state-aware (start vs resume)', () => {
    expect(dashboard).toContain("assessmentInProgress ? 'RESUME YOUR VALU ASSESSMENT' : 'START YOUR VALU ASSESSMENT'")
    expect(dashboard).toContain('assessmentInProgress={assessmentInProgress}')
  })

  test('the assessment action resumes the canonical 58-question full assessment', () => {
    expect(dashboard).toContain('58-question')
  })
})

// ── 10. Canonical VALU v4 scoring parity ─────────────────────────────────
describe('site scoring matches the canonical VALU v4 contract', () => {
  const engine = require('../scoringEngine')
  const contract = require('../valuV4Contract')

  test('the contract constants match the platform values', () => {
    expect(contract.VALU_VERSION).toBe(4)
    expect(contract.MARKETPLACE_SCORE_THRESHOLD).toBe(35)
    expect(contract.CLUSTERS.map(c => [c.id, c.weight, c.maxRaw])).toEqual([
      ['P', 0.20, 36], ['R', 0.25, 48], ['I', 0.25, 60], ['M', 0.20, 36], ['E', 0.10, 36],
    ])
    expect(() => contract.assertCanonicalWeights()).not.toThrow()
  })

  test('pathways use the canonical Development Pathway bands, not the retired names', () => {
    expect(engine.getPathway(75)).toBe('Advanced Development Pathway')
    expect(engine.getPathway(74)).toBe('Cluster Development Pathway')
    expect(engine.getPathway(35)).toBe('Foundation Development Pathway')
    expect(engine.getPathway(34)).toBe('Assessment Follow-up Pathway')
    for (const retired of ['PCP Certification', 'PRIME Programme', 'PRIME Cluster', 'PRIME Sprint']) {
      expect(JSON.stringify(contract.PATHWAYS)).not.toContain(retired)
    }
  })

  test('integrity signals are diagnostics and never mutate the published score', () => {
    // Three validity anchors scored 1 => gamingDetected, but the index must be
    // exactly the weighted cluster result (the old engine multiplied it by 0.8).
    const questions = [
      { id: 'P1', cluster: 'P', skill: 'Communication', options: [{ score: 1 }, { score: 2 }, { score: 3 }, { score: 4 }] },
      { id: 'VA1', cluster: 'VA', skill: 'Validity', validAnchor: true, options: [{ score: 1 }, { score: 2 }, { score: 3 }, { score: 4 }] },
      { id: 'VA2', cluster: 'VA', skill: 'Validity', validAnchor: true, options: [{ score: 1 }, { score: 2 }, { score: 3 }, { score: 4 }] },
      { id: 'VA3', cluster: 'VA', skill: 'Validity', validAnchor: true, options: [{ score: 1 }, { score: 2 }, { score: 3 }, { score: 4 }] },
    ]
    const answers = { 0: 3, 1: 0, 2: 0, 3: 0 }
    const result = engine.computeResults(answers, [60000, 60000, 60000, 60000], {}, questions)
    expect(result.gamingDetected).toBe(true)
    // The published index is exactly the weighted cluster result — the old
    // engine applied a further 0.80 gaming multiplier here.
    expect(result.valuIndex).toBe(engine.computeWeightedIndex(result.clusterScores))
  })

  test('marketplace eligibility is the 35-point threshold, not listing state', () => {
    expect(engine.isMarketplaceScoreEligible(34)).toBe(false)
    expect(engine.isMarketplaceScoreEligible(35)).toBe(true)
    expect(engine.MARKETPLACE_SCORE_THRESHOLD).toBe(35)
  })

  test('the engine carries the version and threshold it scored against', () => {
    const questions = [{ id: 'P1', cluster: 'P', skill: 'Communication', options: [{ score: 1 }, { score: 2 }, { score: 3 }, { score: 4 }] }]
    const result = engine.computeResults({ 0: 3 }, [60000], {}, questions)
    expect(result.valuVersion).toBe(4)
    expect(result.marketplaceScoreThreshold).toBe(35)
  })
})

// ── 11. No hardcoded production hosts in assessment entry points ──────────
describe('assessment entry points do not pin every environment to production', () => {
  test('waitlist and prime use the site-relative brand URL', () => {
    expect(read('src/app/waitlist/page.jsx')).toContain('BRAND.assessmentUrl')
    expect(read('src/app/waitlist/page.jsx')).not.toMatch(/redirect\('https:\/\/valoriainstitute\.com/)
    expect(read('src/app/prime/page.jsx')).toContain('BRAND.assessmentUrl')
    expect(read('src/app/prime/page.jsx')).not.toMatch(/href="https:\/\/valoriainstitute\.com\/valu\/assessment/)
  })

  test('journey/continue hands off through the current host, not a pinned domain', () => {
    const route = read('src/app/journey/continue/route.js')
    expect(route).toContain('const ASSESSMENT_PATH=')
    expect(route).toContain('new URL(ASSESSMENT_PATH,request.url)')
    expect(route).not.toMatch(/ASSESSMENT_ORIGIN\s*=\s*'https:\/\/valoriainstitute\.com/)
  })

  test('welcome-email and reminder links resolve through the env-aware helper', () => {
    expect(read('src/app/api/cron/valu-reminders/route.js')).toContain("siteUrl('/journey/continue')")
    expect(read('src/app/api/cron/valu-reminders/route.js')).toContain("siteUrl('/profile/setup')")
  })
})
