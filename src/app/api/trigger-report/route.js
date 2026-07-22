// src/app/api/trigger-report/route.js
//
// Since 0edcf21 (valoria-platform), confirmation links redirect here
// (valoriainstitute.com/login) instead of back to the assessment app, so
// PRIMEAssessment.jsx's client-side "fire generate-and-send-report the
// moment the identity_hash lands" effect no longer runs — that code lives
// on assessment.valoriainstitute.com and never sees this redirect.
//
// The 15-min sweep-unsent-reports cron still catches this eventually, but
// this route restores the instant path: it's a thin server-to-server relay
// so the browser calls same-origin (no CORS/preflight issues) and this
// route does the actual cross-origin call to the assessment app, where
// CORS doesn't apply.
//
// Fire-and-forget by design from the caller's side — errors here just mean
// the 15-min sweep picks it up instead, so we don't want the login flow to
// hang or fail waiting on this.

const ASSESSMENT_ORIGIN = 'https://assessment.valoriainstitute.com'

export async function POST(request) {
  let identity_hash
  try {
    const body = await request.json()
    identity_hash = body?.identity_hash
  } catch {
    return Response.json({ ok: false, error: 'Invalid request body' }, { status: 400 })
  }

  if (!identity_hash) {
    return Response.json({ ok: false, error: 'identity_hash is required' }, { status: 400 })
  }

  try {
    const res = await fetch(`${ASSESSMENT_ORIGIN}/api/generate-and-send-report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identity_hash }),
    })
    const data = await res.json().catch(() => null)
    return Response.json({ ok: res.ok, upstream: data }, { status: res.ok ? 200 : 502 })
  } catch (err) {
    return Response.json({ ok: false, error: 'Could not reach assessment app', detail: String(err) }, { status: 502 })
  }
}
