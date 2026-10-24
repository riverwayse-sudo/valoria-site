// src/app/api/trigger-report/route.js
//
// Since 0edcf21 (valoria-platform), confirmation links redirect here
// (valoriainstitute.com/login) instead of back to the assessment app, so
// PRIMEAssessment.jsx's client-side "fire generate-and-send-report the
// moment the identity_hash lands" effect no longer runs — that code lives
// on assessment.valoriainstitute.com and never sees this redirect.
//
// The scheduled sweep-unsent-reports recovery job still catches this eventually, but
// this route restores the instant path: it's a thin server-to-server relay
// so the browser calls same-origin (no CORS/preflight issues) and this
// route does the actual cross-origin call to the assessment app, where
// CORS doesn't apply.
//
// Fire-and-forget by design from the caller's side — errors here just mean
// the 15-min sweep picks it up instead, so we don't want the login flow to
// hang or fail waiting on this.

import { isValidReportToken } from '@/lib/api-guard'

// The assessment app origin is the same upstream the site proxies
// /valu/assessment/* to (see next.config.js). Read it from the same variable so
// there is one source of truth per environment; the production value is only a
// fallback for environments that do not set it.
const ASSESSMENT_ORIGIN = process.env.VALU_UPSTREAM_ORIGIN || 'https://assessment.valoriainstitute.com'

export async function POST(request) {
  let body
  try {
    body = await request.json()
  } catch {
    return Response.json({ ok: false, error: 'Invalid request body' }, { status: 400 })
  }

  // The assessment app authorises public report triggers by report_token — an
  // opaque per-assessment UUID — and rejects identity_hash-only requests. The
  // identity_hash is a deterministic name/role fingerprint, so it is guessable
  // and must never be forwarded as if it were an authorization credential.
  // Forward the capability the upstream actually accepts.
  const reportToken = body?.report_token
  if (!isValidReportToken(reportToken)) {
    return Response.json({ ok: false, error: 'A valid report token is required' }, { status: 400 })
  }

  try {
    const res = await fetch(`${ASSESSMENT_ORIGIN}/api/generate-and-send-report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ report_token: reportToken }),
    })
    const data = await res.json().catch(() => null)
    return Response.json({ ok: res.ok, upstream: data }, { status: res.ok ? 200 : 502 })
  } catch (err) {
    console.error('trigger-report: could not reach assessment app')
    return Response.json({ ok: false, error: 'Could not reach assessment app' }, { status: 502 })
  }
}
