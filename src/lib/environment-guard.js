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
// deployment. The rule: a privileged write is allowed only when the runtime
// identity AND the target database are both positively identified. Nothing is
// allowed by default.
//
//   1. VERCEL_ENV=production  -> the target must be the declared production
//                                project (PRODUCTION_SUPABASE_PROJECT_REF).
//   2. VERCEL_ENV set, other  -> the target must be the declared staging project
//      (preview, development,   (STAGING_SUPABASE_PROJECT_REF), and the declared
//       or anything unknown)     production project must be known and different.
//   3. VERCEL_ENV unset/empty -> refused unless local writes are explicitly
//                                enabled (ALLOW_LOCAL_PRIVILEGED_WRITES=true),
//                                and then the target must still be the declared
//                                staging project, with production declared and
//                                different.
//
// There is deliberately no bare "not on Vercel, so allow" branch. An earlier
// version had one, and it was a hole: a deployment whose VERCEL_ENV failed to
// propagate, or any runtime Vercel does not manage, would have been treated as
// local development and allowed to write with production credentials.
//
// CommonJS, matching the other unit-tested lib modules, so the logic can be
// exercised directly and imported by middleware.js.

'use strict'

// Methods that can change state. A GET is normally left alone: the guard is about
// writes. But some route handlers perform writes inside their GET handler (the cron
// jobs, the assessment handoff, the journey refresh, opportunities/messages and
// journey/continue), so a method check alone would let those through. Those paths
// are listed explicitly below.
const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

// Paths whose GET handler writes. Kept as a literal list so adding a writing GET
// route requires a deliberate edit here — the same "missed one" failure mode that
// created this incident.
//
// The list is checked against the source tree by
// src/__tests__/environment-write-guard.test.js, which derives the writing GET
// handlers from the route files and fails if this list disagrees. It was added
// after this list was found to be missing /api/journey and /api/journey/state:
// both call refresh_professional_journey, which INSERTs into professional_journey
// and valoria_journey_events. A hand-maintained list that nothing verifies is the
// defect, not just these two entries.
const GET_WRITE_PATHS = [
  '/api/cron/event-registration-sync',
  '/api/cron/valu-reminders',
  '/api/journey',
  '/api/journey/state',
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
 * Canonical form of a declared project ref.
 *
 * Supabase refs are lowercase and carry no surrounding whitespace, but the value
 * arrives through an operator-managed environment variable, where a copy-paste
 * error (an uppercased ref, a trailing newline) is a realistic way to lock a
 * deployment out of its own database. Normalising the *declaration* cannot widen
 * access: it only ever maps a declaration onto the same project, never onto a
 * different one. The URL side is already lowercased by the WHATWG URL parser.
 */
function normalizeRef(ref) {
  return typeof ref === 'string' ? ref.trim().toLowerCase() : ref
}

/** The environment label used in refusal messages. */
function environmentLabel(vercelEnv) {
  return vercelEnv ? `VERCEL_ENV=${vercelEnv}` : 'an unidentified runtime (VERCEL_ENV is unset)'
}

/**
 * Decide whether a privileged write may proceed.
 * Pure: takes its inputs as arguments so every combination is reachable in a test.
 */
function decideWriteAllowed({
  vercelEnv,
  supabaseUrl,
  productionProjectRef,
  stagingProjectRef,
  allowLocalWrites,
}) {
  const target = supabaseProjectRef(supabaseUrl)
  const declaredProduction = normalizeRef(productionProjectRef)
  const declaredStaging = normalizeRef(stagingProjectRef)

  if (vercelEnv === 'production') {
    if (!declaredProduction) {
      return {
        allowed: false,
        reason:
          'refusing a privileged write from VERCEL_ENV=production because the production database is not declared (set PRODUCTION_SUPABASE_PROJECT_REF to the production project ref)',
      }
    }
    if (!target) {
      return {
        allowed: false,
        reason:
          'refusing a privileged write from VERCEL_ENV=production because the Supabase URL does not identify a project',
      }
    }
    if (target !== declaredProduction) {
      return {
        allowed: false,
        reason: `refusing a privileged write from VERCEL_ENV=production: the configured project ${target} is not the declared production project ${productionProjectRef}`,
      }
    }
    return { allowed: true, reason: 'production' }
  }

  if (!vercelEnv && allowLocalWrites !== true) {
    return {
      allowed: false,
      reason:
        'refusing a privileged write because VERCEL_ENV is unset and local writes are not explicitly enabled (set ALLOW_LOCAL_PRIVILEGED_WRITES=true to permit local development against a declared project)',
    }
  }

  if (!declaredStaging) {
    return {
      allowed: false,
      reason: `refusing a privileged write from ${environmentLabel(vercelEnv)} because no staging database is declared (set STAGING_SUPABASE_PROJECT_REF)`,
    }
  }
  if (!declaredProduction) {
    // A non-production runtime must prove its target is not production, and it
    // cannot do that without knowing which project production is. Skipping the
    // check when the production ref is absent is unsound: a staging declaration
    // that names the production project would then be honoured, and that is
    // exactly the misconfiguration that lets a preview (or a runtime whose
    // VERCEL_ENV is misspelled) write to production. Fail closed instead.
    return {
      allowed: false,
      reason: `refusing a privileged write from ${environmentLabel(vercelEnv)} because the production database is not declared (set PRODUCTION_SUPABASE_PROJECT_REF to the production project ref); without it a non-production runtime cannot be shown to be pointed away from production`,
    }
  }
  if (declaredStaging === declaredProduction) {
    // If the staging declaration names the production project, the declaration is
    // wrong and the write is refused rather than honoured.
    return {
      allowed: false,
      reason: `refusing a privileged write from ${environmentLabel(vercelEnv)} because STAGING_SUPABASE_PROJECT_REF names the production project; a non-production runtime must not target production`,
    }
  }
  if (!target) {
    return {
      allowed: false,
      reason: `refusing a privileged write from ${environmentLabel(vercelEnv)} because the Supabase URL does not identify a project`,
    }
  }
  if (target !== declaredStaging) {
    return {
      allowed: false,
      reason: `refusing a privileged write from ${environmentLabel(vercelEnv)}: the configured project ${target} is not the declared staging project ${declaredStaging}`,
    }
  }
  return {
    allowed: true,
    reason: vercelEnv ? 'declared staging database' : 'local development against the declared staging database',
  }
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
    productionProjectRef: env.PRODUCTION_SUPABASE_PROJECT_REF,
    stagingProjectRef: env.STAGING_SUPABASE_PROJECT_REF,
    allowLocalWrites: env.ALLOW_LOCAL_PRIVILEGED_WRITES === 'true',
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
  normalizeRef,
  MUTATING_METHODS,
  blockedWrite,
  decideWriteAllowed,
  isWritingGet,
  supabaseProjectRef,
}
