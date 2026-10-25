// src/lib/environment-guard.js
//
// Stops a non-production deployment from writing to the production database.
//
// The risk this closes: Vercel's preview environment is configured with the same
// Supabase URL and service-role key as production. Thirty-two route handlers build
// their own service-role client, and none of them checks which environment it is
// running in, so a preview deployment — including one built from an unreviewed
// branch — can create accounts, claim tasters and mutate real participant data.
// That is why the staging acceptance suite has not been run.
//
// Enforcing this per-route would mean editing thirty-two files and every future
// one, and missing one is exactly the kind of omission that caused this. So the
// check lives in middleware, whose matcher already covers /api, and applies to any
// mutating method. A new route is covered the moment it exists.
//
// The decision is a pure function so it can be tested exhaustively without a
// deployment. The rule, in order:
//
//   1. VERCEL_ENV=production        -> allow. This is production.
//   2. VERCEL_ENV unset or empty    -> allow. Not a Vercel-managed deployment, so
//                                      local development or a test runner. Vercel
//                                      always sets VERCEL_ENV on deployments, so an
//                                      unset value cannot be a preview.
//   3. anything else (preview, ...) -> allow only when the configured Supabase
//                                      project is the one declared as staging.
//
// Rule 3 fails closed at every step: no declared staging project, no Supabase URL,
// or a URL whose project ref cannot be read all deny the write. The failure mode is
// a refused write with a clear message, not a silent write to production.
//
// CommonJS, matching the other unit-tested lib modules, so the logic can be
// exercised directly and imported by middleware.js.

'use strict'

// Methods that can change state. A GET is normally left alone: the guard is about
// writes. But six route handlers perform writes inside their GET handler (the cron
// jobs, the assessment handoff, journey value-activation, opportunities/messages
// and journey/continue), so a method check alone would let those through. Those
// paths are listed explicitly below.
const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

// Paths whose GET handler writes. Kept as a literal list so adding a writing GET
// route requires a deliberate edit here — the same "missed one" failure mode that
// created this incident.
const GET_WRITE_PATHS = [
  '/api/cron/event-registration-sync',
  '/api/cron/valu-reminders',
  '/api/journey/value-activation',
  '/api/opportunities/messages',
  '/api/valu-handoff',
  '/journey/continue',
]

function isWritingGet(pathname) {
  const path = String(pathname || '')
  return GET_WRITE_PATHS.some(p => path === p || path.startsWith(p + '/'))
}

/** Extract the project ref from a Supabase URL, or null if it is not one. */
function supabaseProjectRef(url) {
  if (typeof url !== 'string' || !url) return null
  let host
  try {
    host = new URL(url).hostname
  } catch {
    return null
  }
  const match = host.match(/^([a-z0-9]{20})\.supabase\.(?:co|in)$/)
  return match ? match[1] : null
}

/**
 * Decide whether a privileged write may proceed.
 * Pure: takes its inputs as arguments so every combination is reachable in a test.
 */
function decideWriteAllowed({ vercelEnv, supabaseUrl, stagingProjectRef }) {
  if (vercelEnv === 'production') {
    return { allowed: true, reason: 'production' }
  }
  if (!vercelEnv) {
    return { allowed: true, reason: 'non-vercel' }
  }
  if (!stagingProjectRef) {
    return {
      allowed: false,
      reason: `refusing a privileged write from VERCEL_ENV=${vercelEnv} because no staging database is declared (set STAGING_SUPABASE_PROJECT_REF)`,
    }
  }
  const ref = supabaseProjectRef(supabaseUrl)
  if (!ref) {
    return {
      allowed: false,
      reason: `refusing a privileged write from VERCEL_ENV=${vercelEnv} because the Supabase URL does not identify a project`,
    }
  }
  if (ref !== stagingProjectRef) {
    return {
      allowed: false,
      reason: `refusing a privileged write from VERCEL_ENV=${vercelEnv}: the configured project ${ref} is not the declared staging project ${stagingProjectRef}`,
    }
  }
  return { allowed: true, reason: 'declared staging database' }
}

/**
 * Whether this request must be blocked before it reaches a route handler.
 * Returns null when the request may proceed.
 */
function blockedWrite(request, env = process.env) {
  const method = String(request?.method || 'GET').toUpperCase()
  const pathname = request?.nextUrl?.pathname || ''
  const isWrite = MUTATING_METHODS.has(method) || (method === 'GET' && isWritingGet(pathname))
  if (!isWrite) return null

  const decision = decideWriteAllowed({
    vercelEnv: env.VERCEL_ENV,
    supabaseUrl: env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL,
    stagingProjectRef: env.STAGING_SUPABASE_PROJECT_REF,
  })
  if (decision.allowed) return null

  return {
    status: 503,
    body: {
      error: 'Write refused: this deployment is not authorised to modify this database.',
      detail: decision.reason,
    },
  }
}

module.exports = {
  GET_WRITE_PATHS,
  MUTATING_METHODS,
  blockedWrite,
  decideWriteAllowed,
  isWritingGet,
  supabaseProjectRef,
}
