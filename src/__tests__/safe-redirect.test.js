// src/__tests__/safe-redirect.test.js
//
// Regression coverage for the post-authentication open redirect (CWE-601).
//
// Incident: login/page.jsx and signup/page.jsx read a `returnTo` query
// parameter and guarded it with `value.startsWith('/')`. That guard is not
// sufficient. A protocol-relative URL starts with '/' but carries its own
// authority, so the browser resolves it against the page's scheme:
//
//   window.location.href = '//evil.com'  →  https://evil.com/
//
// The user therefore signed in on the genuine Valoria form and was immediately
// handed to an attacker's site — a phishing pivot on the exact domain the
// participant is being asked to trust. A tab, newline or backslash variant
// bypassed the same guard, because URL parsers normalise those away.

"use strict";

const { safeReturnPath, safeReturnPathOr } = require("../lib/safe-redirect");
const { readFileSync } = require("fs");
const { join } = require("path");

const siteRoot = join(__dirname, "../..");
const read = p => readFileSync(join(siteRoot, p), "utf8");

describe('safeReturnPath — rejects values that escape the origin', () => {
  const hostile = [
    '//evil.com',
    '//evil.com/path',
    '///evil.com',
    '////evil.com',
    '/\\evil.com',
    '\\/evil.com',
    '\\\\evil.com',
    '/\t/evil.com',
    '/\n/evil.com',
    'https://evil.com',
    'http://evil.com',
    'javascript:alert(1)',
    'data:text/html,<script>alert(1)</script>',
    'HTTPS://evil.com',
    '//evil.com:8443/x',
    // Dot-segment normalisation happens during resolution, so a value that
    // looks like a path can resolve to a protocol-relative one. This was a real
    // bypass in the first version of the helper.
    '/..//evil.com',
    '/a/..//evil.com',
    '/./..//evil.com',
    '/..\\evil.com',
  ]

  test.each(hostile)('rejects %j', value => {
    expect(safeReturnPath(value)).toBeNull()
  })

  test('rejects non-strings and empty values', () => {
    for (const value of [null, undefined, 42, {}, [], '', 'dashboard', ' ', true]) {
      expect(safeReturnPath(value)).toBeNull()
    }
  })

  test('never returns a value that navigates off-origin', () => {
    // The strong invariant: whatever safeReturnPath returns must resolve to a
    // same-origin path. Checking the return value against the same base a
    // browser would use catches re-emission bugs.
    const base = 'https://valoriainstitute.com'
    const attempts = [
      '/..//evil.com', '/a/..//evil.com', '//evil.com', '///evil.com',
      '/\\evil.com', '/dashboard', '/journey/continue?stage=assess',
      '/profile/edit', '/a/../b', '/%2F%2Fevil.com',
    ]
    for (const attempt of attempts) {
      const result = safeReturnPath(attempt)
      if (result === null) continue
      expect(new URL(result, base).origin).toBe(base)
    }
  })

  test('a space in the path is inert, not an escape', () => {
    // '/ /evil.com' percent-encodes the space and stays same-origin, so it is
    // not an open redirect. It is still rejected as a non-path, but the reason
    // matters: this is not a security case.
    const resolved = new URL('/ /evil.com', 'https://valoriainstitute.com')
    expect(resolved.origin).toBe('https://valoriainstitute.com')
  })

  test('rejects control characters anywhere in the value', () => {
    expect(safeReturnPath('/dash\u0000board')).toBeNull()
    expect(safeReturnPath('/dash\u001fboard')).toBeNull()
    expect(safeReturnPath('/dash\u007fboard')).toBeNull()
  })
})

describe('safeReturnPath — percent-encoded input', () => {
  test('percent-encoded separators do not escape when passed through undecoded', () => {
    // These arrive from a query string and are not decoded before use. The
    // browser does not treat %2F as a path separator, so they stay same-origin.
    const base = 'https://valoriainstitute.com'
    for (const value of ['/%2F%2Fevil.com', '/%5Cevil.com', '/%09/evil.com', '/%0A/evil.com']) {
      const result = safeReturnPath(value)
      if (result === null) continue
      expect(new URL(result, base).origin).toBe(base)
    }
  })

  test('a decoded value that escapes is still rejected', () => {
    // If a caller ever decodes first, the decoded form must be caught. This is
    // why the helper re-validates its own output rather than trusting the input.
    for (const decoded of ['///evil.com', '/\\evil.com', '/\t/evil.com']) {
      expect(safeReturnPath(decoded)).toBeNull()
    }
  })
})

describe('safeReturnPath — accepts genuine same-origin paths', () => {
  test('accepts ordinary application paths unchanged', () => {
    expect(safeReturnPath('/dashboard')).toBe('/dashboard')
    expect(safeReturnPath('/profile/edit')).toBe('/profile/edit')
    expect(safeReturnPath('/employer/dashboard')).toBe('/employer/dashboard')
  })

  test('preserves query strings and fragments', () => {
    expect(safeReturnPath('/journey/continue?stage=assess')).toBe('/journey/continue?stage=assess')
    expect(safeReturnPath('/report?identity_hash=fp_abc123')).toBe('/report?identity_hash=fp_abc123')
    expect(safeReturnPath('/profile/passport#section')).toBe('/profile/passport#section')
  })

  test('the journey continuation path used by the assessment flow survives intact', () => {
    const target = '/journey/continue?stage=assess&taster_id=t_123&resume=r_456'
    expect(safeReturnPath(target)).toBe(target)
  })
})

describe('safeReturnPathOr', () => {
  test('falls back to the default for hostile input', () => {
    expect(safeReturnPathOr('//evil.com', '/dashboard')).toBe('/dashboard')
    expect(safeReturnPathOr(null, '/dashboard')).toBe('/dashboard')
  })

  test('returns the safe path when one is supplied', () => {
    expect(safeReturnPathOr('/journey', '/dashboard')).toBe('/journey')
  })
})

describe('call sites cannot silently regress to the bare guard', () => {
  const callSites = ['src/app/login/page.jsx', 'src/app/signup/page.jsx']

  test.each(callSites)('%s validates returnTo through the shared helper', file => {
    const source = read(file)
    expect(source).toContain('safeReturnPath')
    // The exact construct that was vulnerable.
    expect(source).not.toMatch(/startsWith\(['"]\/['"]\)\s*\?\s*value/)
  })

  test('no client file navigates using an unvalidated returnTo value', () => {
    // A guard of the form `x.startsWith('/') ? x : y` is the vulnerable shape.
    const offenders = []
    for (const file of callSites) {
      const source = read(file)
      if (/returnTo\s*&&\s*returnTo\.startsWith\(['"]\/['"]\)/.test(source)) offenders.push(file)
    }
    expect(offenders).toEqual([])
  })
})
