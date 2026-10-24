// src/lib/api-guard.js
//
// Request-guard primitives shared by public API routes.
//
// CommonJS on purpose: this repo's unit-tested lib modules are CJS and the jest
// setup does not transform the ESM used by the route files themselves, so logic
// that needs behavioural tests lives here and the routes import it.

'use strict'

// Must match the format the platform's generate-and-send-report validates
// (api/generate-and-send-report.js). A token this guard accepts is one the
// upstream will accept, so the site cannot forward a request the assessment
// app will reject.
const REPORT_TOKEN_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

// The deterministic name/role fingerprint. It is an identifier, not a secret:
// it is derived from user-supplied values, so it must never be treated as proof
// of identity or as an authorization credential.
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
