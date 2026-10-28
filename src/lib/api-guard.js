// src/lib/api-guard.js
//
// Request-guard primitives shared by public API routes.
//
// CommonJS, like the other unit-tested lib modules in this repo, so the logic
// can be exercised directly. The route files that import it are ESM and are
// covered by runtime tests (jest.config.js maps '@/' and transforms them), so
// these helpers do not need to carry the whole contract on their own.

'use strict'

// Must match the format the platform's generate-and-send-report validates
// (valoria-final/api/generate-and-send-report.js:29). A token this guard
// accepts is one the upstream will accept, so the site cannot forward a
// request the assessment app is guaranteed to reject.
const REPORT_TOKEN_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

// The deterministic name/role fingerprint (valoria-final/src/lockEngine.js).
// It is an identifier, not a secret: it is derived from user-supplied values,
// so it must never be treated as proof of identity or as a credential.
const IDENTITY_HASH_RE = /^fp_[a-z0-9]{1,128}$/i

function isValidReportToken(value) {
  return typeof value === 'string' && REPORT_TOKEN_RE.test(value.trim())
}

function isValidIdentityHash(value) {
  return typeof value === 'string' && IDENTITY_HASH_RE.test(value.trim())
}

// A welcome email is only legitimate for an account that was just created and
// whose address is the recipient's. Anchoring to the account keeps the signup
// journey working without turning the route into an open relay for arbitrary
// addresses. `user` is the auth user record; `email` is the requested recipient.
function signupEmailEligible(user, email, { now = Date.now(), windowSeconds = 900 } = {}) {
  if (!user || typeof user !== 'object') return false
  if (typeof user.email !== 'string' || typeof email !== 'string') return false
  if (user.email.trim().toLowerCase() !== email.trim().toLowerCase()) return false
  const createdAt = Date.parse(user.created_at)
  if (!Number.isFinite(createdAt)) return false
  const ageSeconds = (now - createdAt) / 1000
  // Allow a small negative age for clock skew between the auth service and here.
  return ageSeconds >= -300 && ageSeconds <= windowSeconds
}

module.exports = { isValidReportToken, isValidIdentityHash, signupEmailEligible }
