// src/__tests__/resilience-regressions.test.js
//
// Regression coverage for the staging remediation resilience fixes. Each test
// pins a defect that was reproduced at runtime, so it cannot silently regress.
// No mocks: the helpers under test are the real code middleware and the
// Supabase client modules use in production.

const fs = require('fs')
const path = require('path')

const root = process.cwd()
const read = file => fs.readFileSync(path.join(root, file), 'utf8')

const routing = require('../lib/middleware-routing')
const { resolveSupabaseUrl, PLACEHOLDER_URL } = require('../lib/supabase-url')

// ── 1. Assessment assets must never reach the Supabase auth path ──────────
// Incident: /valu/assessment/assets/*.js|css returned 500 whenever Supabase
// auth failed, because the middleware ran an unguarded auth call on them.
describe('middleware bypass keeps assessment assets off the auth path', () => {
  const mustBypass = [
    '/valu/assessment',
    '/valu/assessment/',
    '/valu/assessment/assets/index-DBNncGId.js',
    '/valu/assessment/assets/index-C2fFoBQa.css',
    '/valu/assessment/assets/chunk-abc123.mjs',
    '/valu/assessment/assets/logo.svg',
    '/valu/assessment/assets/font.woff2',
  ]

  test.each(mustBypass)('%s bypasses auth', p => {
    expect(routing.shouldBypassAuth(p)).toBe(true)
  })

  test('the .js and .css extensions that caused the outage are treated as static', () => {
    // The original allowlist had png/jpg/svg/ico/webp/woff/woff2/ttf but not js/css.
    expect(routing.isStaticAssetPath('/anything/app.js')).toBe(true)
    expect(routing.isStaticAssetPath('/anything/app.css')).toBe(true)
    expect(routing.isStaticAssetPath('/anything/app.mjs')).toBe(true)
  })

  test('genuinely gated routes are NOT bypassed', () => {
    for (const p of ['/admin', '/admin/users', '/dashboard', '/profile/edit', '/login', '/prime']) {
      expect(routing.shouldBypassAuth(p)).toBe(false)
    }
  })

  test('a path merely starting with the same characters is not treated as the assessment app', () => {
    expect(routing.shouldBypassAuth('/valu/assessments')).toBe(false)
    expect(routing.shouldBypassAuth('/valu/assessment-fake')).toBe(false)
  })
})

// ── 2. Middleware source keeps the guard and the matcher exclusion ────────
describe('middleware.js wiring', () => {
  const src = read('src/middleware.js')

  test('delegates the bypass decision to the tested helper', () => {
    expect(src).toMatch(/shouldBypassAuth\(pathname\)/)
    expect(src).toMatch(/from '\.\/lib\/middleware-routing\.js'/)
  })

  test('client construction and getUser are both inside the failure guard', () => {
    // A malformed NEXT_PUBLIC_SUPABASE_URL makes createServerClient throw
    // synchronously. That throw must not escape, or every page 500s.
    const tryBlock = src.slice(src.indexOf('try {'), src.indexOf('} catch {'))
    expect(tryBlock).toMatch(/createServerClient\(/)
    expect(tryBlock).toMatch(/auth\.getUser\(\)/)
  })

  test('admin guard still fails closed (redirect to login) when identity is unavailable', () => {
    expect(src).toMatch(/pathname\.startsWith\('\/admin'\)/)
    expect(src).toMatch(/NextResponse\.redirect\(loginUrl\)/)
  })

  test('matcher excludes the assessment prefix', () => {
    const matcher = src.match(/matcher:\s*\[([^\]]*)\]/)
    expect(matcher).toBeTruthy()
    expect(matcher[1]).toContain('valu/assessment')
  })
})

// ── 3. Malformed Supabase URL must degrade, not crash ─────────────────────
// Incident: "Invalid supabaseUrl: Must be a valid HTTP or HTTPS URL." thrown at
// module import time turned /certificate/[token], /profile/[id] and (via
// middleware) every page into a 500.
describe('resolveSupabaseUrl degrades instead of throwing', () => {
  test('accepts valid http(s) URLs unchanged', () => {
    expect(resolveSupabaseUrl('https://abcdefg.supabase.co')).toBe('https://abcdefg.supabase.co')
    expect(resolveSupabaseUrl('http://localhost:54321')).toBe('http://localhost:54321')
  })

  test('falls back to the placeholder for malformed values', () => {
    for (const bad of ['not-a-valid-url', 'ftp://x.example', 'javascript:alert(1)', '', '   ', undefined, null]) {
      expect(resolveSupabaseUrl(bad)).toBe(PLACEHOLDER_URL)
    }
  })

  test('the resolved placeholder does not throw when a client is constructed', () => {
    // This is the exact call that crashed the routes.
    const { createClient } = require('@supabase/supabase-js')
    expect(() => createClient(resolveSupabaseUrl('not-a-valid-url'), 'placeholder-anon-key')).not.toThrow()
  })

  test('the browser client module and every module-scope client use the guard', () => {
    expect(read('src/lib/supabase.js')).toMatch(/resolveSupabaseUrl\(process\.env\.NEXT_PUBLIC_SUPABASE_URL\)/)
    for (const file of ['src/app/certificate/[token]/page.jsx', 'src/app/profile/[id]/layout.jsx', 'src/app/profile/[id]/page.jsx']) {
      const src = read(file)
      expect(src).toMatch(/resolveSupabaseUrl\(process\.env\.NEXT_PUBLIC_SUPABASE_URL\)/)
      // No module-scope client may fall back to a raw env value again.
      expect(src).not.toMatch(/createClient\(\s*process\.env\.NEXT_PUBLIC_SUPABASE_URL/)
    }
  })
})
