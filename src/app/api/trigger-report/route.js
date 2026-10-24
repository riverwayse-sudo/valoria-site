// src/app/api/trigger-report/route.js
//
// Since 0edcf21 (valoria-platform), confirmation links redirect to the site's
// /auth/callback (then /login) instead of back to the assessment app, so
// PRIMEAssessment.jsx's client-side "fire generate-and-send-report the moment
// the identity_hash lands" effect no longer runs — that code lives on
// assessment.valoriainstitute.com and never sees this redirect.
//
// The scheduled sweep-unsent-reports recovery job catches this eventually, and
// this route was meant to restore the instant path as a thin server-to-server
// relay.
//
// AUDIT FINDING — the relay could not work, and its shape was unsafe:
//
//   1. It forwarded only `identity_hash`. The platform's
//      /api/generate-and-send-report accepts an identity-only call ONLY from an
//      authorised worker presenting `Authorization: Bearer ${CRON_SECRET}`;
//      otherwise it requires a valid `report_token`. This relay sent no
//      credential and no token, so every call was rejected
//      ("Valid report token is required", HTTP 400). Verified against
//      production: an identity-only POST returns exactly that 400.
//   2. Nothing ever sent identity_hash to /login, so the client trigger this
//      route was built for does not exist. The route was unreachable in
//      practice.
//   3. It accepted any identity_hash from any caller and relayed it upstream,
//      and it echoed the upstream JSON — which contains `report_token`, a
//      credential that authorises report retrieval — straight back to the
//      caller. Combined with a guessable identity_hash (`computeFingerprint`
//      is a 32-bit non-cryptographic hash of `name|role`, not a secret), a
//      caller who knew or guessed a participant's name and role could have used
//      this route to obtain their report_token.
//
// What this route is now: an authenticated, token-bearing relay for the
// identity hash the signed-in user actually owns. The browser still calls
// same-origin (no CORS/preflight), and the route performs the cross-origin call
// where CORS does not apply.
//
//   POST { report_token }  with  Authorization: Bearer <supabase access_token>
//
// The report_token is the intended capability for report delivery: it is minted
// per assessment and the platform's public trigger path is already rate-limited
// and idempotent by token. The relay therefore adds no new authority — it
// forwards the caller's own token, and it never returns the token in its
// response.
//
// The platform origin is the same upstream the site proxies /valu/assessment/*
// to (see next.config.js). Read it from the same variable so there is one source
// of truth per environment; the production value is only a fallback for
// environments that do not set it.

import { getPrivilegedClient } from '@/lib/supabase-server'
import { isValidReportToken } from '@/lib/api-guard'

const ASSESSMENT_ORIGIN = process.env.VALU_UPSTREAM_ORIGIN || 'https://assessment.valoriainstitute.com'

// The token format is validated against the same definition the platform's
// generate-and-send-report enforces, so this relay cannot forward a token the
// assessment app will reject. See src/lib/api-guard.js.
const RATE_LIMIT_MAX = 10
const RATE_LIMIT_WINDOW_SECONDS = 3600

function json(body, status) {
  return Response.json(body, { status })
}

// Best-effort per-IP limit. The platform already enforces its own per-token
// limit on the public trigger path; this only blunts a caller enumerating
// tokens from a single address. It fails OPEN: the upstream limiter is the real
// control, and refusing a legitimate delivery because a limiter RPC was
// unavailable would silently cost the participant their report.
async function withinRateLimit(request) {
  try {
    const supabase = getPrivilegedClient()
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      request.headers.get('x-real-ip') ||
      'unknown'
    const { data, error } = await supabase.rpc('check_rate_limit', {
      p_key: `trigger-report:${ip}`,
      p_max_count: RATE_LIMIT_MAX,
      p_window_seconds: RATE_LIMIT_WINDOW_SECONDS,
    })
    if (error) {
      console.error('trigger-report rate limit check failed:', error)
      return true
    }
    return Boolean(data)
  } catch (err) {
    console.error('trigger-report rate limiter unavailable:', err?.message || err)
    return true
  }
}

async function authenticate(request) {
  const header = request.headers.get('authorization') || ''
  const token = header.toLowerCase().startsWith('bearer ') ? header.slice(7).trim() : ''
  if (!token) return null
  try {
    const { data, error } = await getPrivilegedClient().auth.getUser(token)
    if (error || !data?.user) return null
    return data.user
  } catch (err) {
    console.error('trigger-report auth check failed:', err?.message || err)
    return null
  }
}

export async function POST(request) {
  // Authentication is checked before anything else, including token shape, so
  // every unauthenticated request is a 401 and none of them can reach the
  // upstream — no token probing, no relay. Delivery is tied to the caller's own
  // completed assessment, so an anonymous caller must not use this route.
  const user = await authenticate(request)
  if (!user) {
    return json({ ok: false, error: 'Authentication required' }, 401)
  }

  let reportToken
  try {
    const body = await request.json()
    reportToken = body?.report_token
  } catch {
    return json({ ok: false, error: 'Invalid request body' }, 400)
  }

  if (!isValidReportToken(reportToken)) {
    return json({ ok: false, error: 'A valid report_token is required' }, 400)
  }

  if (!(await withinRateLimit(request))) {
    return json({ ok: false, error: 'Too many requests — please try again later.' }, 429)
  }

  try {
    const res = await fetch(`${ASSESSMENT_ORIGIN}/api/generate-and-send-report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ report_token: reportToken }),
    })
    const data = await res.json().catch(() => null)
    // Never echo the upstream payload: it carries report_token and the full
    // results object. Report only whether delivery was accepted.
    if (!res.ok) {
      console.error('trigger-report upstream rejected the request:', res.status)
      return json({ ok: false, error: 'Report could not be triggered.' }, 502)
    }
    return json({ ok: true, reportReady: Boolean(data?.reportReady) }, 200)
  } catch (err) {
    console.error('trigger-report could not reach the assessment app:', err?.message || err)
    return json({ ok: false, error: 'Could not reach assessment app' }, 502)
  }
}
