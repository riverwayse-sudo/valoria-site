// src/__tests__/api-abuse-controls-contract.test.js
//
// Regression coverage for the two public abuse surfaces reported in the audit:
//
//   F1  /api/trigger-report  — forwarded a guessable name/role fingerprint
//                              (identity_hash) to a privileged upstream endpoint.
//   F2  /api/welcome-email   — mailed any syntactically valid address with no
//                              authentication, rate limit, or eligibility check.
//
// The decision logic for both lives in src/lib/api-guard.js (CommonJS) so it can
// be executed for real here; the route files themselves are ESM and this repo's
// jest setup does not transform them, so the routes are covered by asserting the
// guard is wired into the real source rather than by importing them.

'use strict'

const fs = require('fs')
const path = require('path')

const { isValidReportToken, isValidIdentityHash, signupEmailEligible } = require('../lib/api-guard.js')

function read(relative) {
  return fs.readFileSync(path.join(__dirname, '..', relative), 'utf8')
}

// A well-formed v4 UUID, the shape the platform issues as report_token.
const TOKEN = '9f1c2d3e-4a5b-4c6d-8e7f-0a1b2c3d4e5f'

describe('F1 — report trigger requires the upstream capability', () => {
  test('accepts the opaque report token the assessment app authorises by', () => {
    expect(isValidReportToken(TOKEN)).toBe(true)
    expect(isValidReportToken(TOKEN.toUpperCase())).toBe(true)
    expect(isValidReportToken(`  ${TOKEN}  `)).toBe(true)
  })

  test('rejects malformed, missing and non-string report tokens', () => {
    for (const bad of [undefined, null, '', '   ', 123, {}, [], 'not-a-uuid', 'fp_abc123']) {
      expect(isValidReportToken(bad)).toBe(false)
    }
  })

  test('rejects tokens that are not v4 UUIDs, so a forged value cannot pass', () => {
    // Version nibble outside [1-8], then variant nibble outside [89ab].
    // Mirrors the platform's isValidReportToken so the site cannot forward a
    // token the assessment app will reject.
    expect(isValidReportToken('9f1c2d3e-4a5b-9c6d-8e7f-0a1b2c3d4e5f')).toBe(false)
    expect(isValidReportToken('9f1c2d3e-4a5b-4c6d-ce7f-0a1b2c3d4e5f')).toBe(false)
  })

  test('the identity_hash is recognised but is not a report token', () => {
    // The fingerprint is a valid identifier...
    expect(isValidIdentityHash('fp_1a2b3c')).toBe(true)
    // ...but must never be accepted where a capability is required.
    expect(isValidReportToken('fp_1a2b3c')).toBe(false)
  })

  test('the route forwards report_token and no longer forwards identity_hash', () => {
    const route = read('app/api/trigger-report/route.js')
    expect(route).toContain('isValidReportToken')
    expect(route).toContain('body?.report_token')
    expect(route).toContain('report_token: reportToken')
    // The old body forwarded the fingerprint as if it were a credential.
    expect(route).not.toContain('JSON.stringify({ identity_hash })')
    expect(route).not.toMatch(/JSON\.stringify\(\{\s*identity_hash\s*\}\)/)
  })

  test('the route validates before it calls the upstream', () => {
    const route = read('app/api/trigger-report/route.js')
    const guardIndex = route.indexOf('isValidReportToken(reportToken)')
    const fetchIndex = route.indexOf('await fetch(')
    expect(guardIndex).toBeGreaterThan(-1)
    expect(fetchIndex).toBeGreaterThan(guardIndex)
  })

  test('the caller sends the report token carried on the confirmation link', () => {
    const login = read('app/login/page.jsx')
    expect(login).toContain("params.get('report_token')")
    expect(login).toContain('report_token: reportToken')
    // It must not post the fingerprint to the trigger route any more.
    expect(login).not.toContain('JSON.stringify({ identity_hash: identityHash })')
  })
})

describe('F2 — welcome email is limited to a just-created account', () => {
  const now = Date.parse('2026-10-23T12:00:00Z')

  function user(overrides = {}) {
    return {
      id: 'user-1',
      email: 'buyer@example.com',
      created_at: '2026-10-23T11:59:30Z',
      ...overrides,
    }
  }

  test('a freshly created account matches its own address', () => {
    expect(signupEmailEligible(user(), 'buyer@example.com', { now })).toBe(true)
  })

  test('matching is case- and whitespace-insensitive', () => {
    expect(signupEmailEligible(user(), '  BUYER@Example.com ', { now })).toBe(true)
  })

  test('an arbitrary recipient is refused, so the route is not an open relay', () => {
    expect(signupEmailEligible(user(), 'victim@example.com', { now })).toBe(false)
  })

  test('a pre-existing account cannot be used to re-send a welcome email', () => {
    const old = user({ created_at: '2026-01-01T00:00:00Z' })
    expect(signupEmailEligible(old, 'buyer@example.com', { now })).toBe(false)
  })

  test('missing, malformed and unknown users fail closed', () => {
    for (const bad of [null, undefined, {}, 'user', 42]) {
      expect(signupEmailEligible(bad, 'buyer@example.com', { now })).toBe(false)
    }
    expect(signupEmailEligible(user({ created_at: 'not-a-date' }), 'buyer@example.com', { now })).toBe(false)
    expect(signupEmailEligible(user({ email: undefined }), 'buyer@example.com', { now })).toBe(false)
  })

  test('a small negative age is tolerated for clock skew but not a large one', () => {
    const skewed = user({ created_at: '2026-10-23T12:00:30Z' })
    expect(signupEmailEligible(skewed, 'buyer@example.com', { now })).toBe(true)
    const farFuture = user({ created_at: '2026-10-24T12:00:00Z' })
    expect(signupEmailEligible(farFuture, 'buyer@example.com', { now })).toBe(false)
  })

  test('the route enforces eligibility and both rate limits before sending', () => {
    const route = read('app/api/welcome-email/route.js')
    expect(route).toContain('signupEmailEligible')
    expect(route).toContain('welcome-email-ip:')
    expect(route).toContain('welcome-email-to:')
    expect(route).toContain("rpc('check_rate_limit'")
    // Order matters: the eligibility check must precede the provider call.
    expect(route.indexOf('signupEmailEligible(user, email)'))
      .toBeLessThan(route.indexOf('api.brevo.com'))
  })

  test('the route does not leak provider error bodies to the caller', () => {
    const route = read('app/api/welcome-email/route.js')
    // The old code read the Brevo response body and logged it; that body can
    // echo the recipient address.
    expect(route).not.toContain('res.text()')
    expect(route).not.toContain("error: 'Send failed.', detail")
  })

  test('the signup caller identifies the account it just created', () => {
    const signup = read('app/signup/page.jsx')
    expect(signup).toContain('user_id: data.user?.id')
  })
})
