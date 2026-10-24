// src/app/api/trigger-report/route.js
//
// Confirmation links used to land back on the assessment app, whose own client
// code fired report generation the moment the identity_hash appeared. They now
// land on the site's /login instead, so this same-origin proxy restores that
// instant trigger. It is fire-and-forget: the 15-minute sweep-unsent-reports
// cron is the safety net if this fails or the user never gets this far.
//
// AUDIT FINDING — the relay was both a dead end and an open proxy:
//
//   1. It forwarded only `identity_hash`. The assessment app accepts an
//      identity-only call only from an authorised worker presenting
//      `Authorization: Bearer ${CRON_SECRET}`; otherwise it requires a valid
//      `report_token` (generate-and-send-report.js:162-167). This relay sent
//      neither, so every call was rejected with
//      "Valid report token is required" (HTTP 400), which the route mapped to
//      502. Verified against production. The instant path silently fell back to
//      the sweep.
//   2. `identity_hash` is not a secret. It is `fp_${hash}` — a 32-bit,
//      non-cryptographic fingerprint of the lowercased `name|role` pair
//      (valoria-final/src/lockEngine.js), so it is deterministic and
//      enumerable: two people with the same name and role share one. Forwarding
//      it to a privileged endpoint treated a guessable identifier as a
//      credential.
//   3. It echoed the upstream JSON — which carries `report_token` — back to the
//      caller.
//
// What this route is now: it forwards the capability the upstream actually
// accepts, and nothing else. The confirmation redirect already carries
// `report_token` (create-account.js:123 and resend-confirmation.js:70 build
// `${VALORIA_SITE_URL}/auth/callback?identity_hash=…&report_token=…`), and
// /login passes it through. The token is an opaque per-assessment v4 UUID, so
// this is strictly narrower than forwarding a guessable fingerprint.
//
// No session is required, and that is deliberate: the legitimate caller is
// /login *before* sign-in, so a session check would break the workflow. The
// upstream is the authority and applies its own controls to public triggers —
// a per-IP limit (10/hour) and a per-token limit via consume_rate_limit
// (generate-and-send-report.js:169-177). The route therefore does not need to
// re-authenticate the caller; it needs to stop forwarding a forgeable value.
//
// The upstream response is not echoed: it contains the report token and the
// full results object, neither of which the caller needs.
//
// The assessment origin is the same upstream the site proxies
// /valu/assessment/* to (see next.config.js). Read it from the same variable so
// there is one source of truth per environment; the production value is only a
// fallback for environments that do not set it.

import { isValidReportToken } from '@/lib/api-guard'
import { normalizeOrigin } from '@/lib/site-url'

// Normalised, not used raw: a configured origin with a trailing slash produced
// a double slash in the upstream URL (https://host//api/...), which the
// assessment app does not route. Same defect class as the site-origin
// concatenation this branch already fixed.
const ASSESSMENT_ORIGIN = normalizeOrigin(process.env.VALU_UPSTREAM_ORIGIN) || 'https://assessment.valoriainstitute.com'

function json(body, status) {
  return Response.json(body, { status })
}

export async function POST(request) {
  let body
  try {
    body = await request.json()
  } catch {
    return json({ ok: false, error: 'Invalid request body' }, 400)
  }

  const reportToken = body?.report_token
  if (!isValidReportToken(reportToken)) {
    return json({ ok: false, error: 'A valid report token is required' }, 400)
  }

  try {
    const res = await fetch(`${ASSESSMENT_ORIGIN}/api/generate-and-send-report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ report_token: reportToken.trim() }),
    })
    // Drain the body without inspecting it: it carries the report token and
    // the full results object, which the caller must not receive.
    await res.json().catch(() => null)
    if (!res.ok) {
      console.error('trigger-report: upstream rejected the request with status', res.status)
      return json({ ok: false, error: 'Report could not be triggered.' }, 502)
    }
    return json({ ok: true }, 200)
  } catch (err) {
    console.error('trigger-report: could not reach the assessment app:', err?.message || 'unknown')
    return json({ ok: false, error: 'Could not reach assessment app' }, 502)
  }
}
