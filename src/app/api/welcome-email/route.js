// src/app/api/welcome-email/route.js
//
// Sends a Valoria-branded welcome email to new buyer accounts right after
// signup — separate from Supabase's own bare confirmation-link email,
// which has no branding or context. Buyers had no welcome treatment of any
// kind before this; only the waitlist flow ever sent anything.
//
// Professionals aren't included here — they already get a "Welcome,
// {name}." branded email (with their score and a Complete Your Profile
// CTA) as part of report delivery in the assessment app's send-email.js.
// A second one would just be redundant.

const BREVO_KEY = process.env.BREVO_API_KEY
const FROM_EMAIL = 'info@valoriainstitute.com'
const FROM_NAME  = 'Valoria Institute'

export async function POST(request) {
  if (!BREVO_KEY) {
    console.error('Welcome email skipped: BREVO_API_KEY not configured.')
    return new Response(JSON.stringify({ ok: false, error: 'Email not configured.' }), {
      status: 501, headers: { 'Content-Type': 'application/json' },
    })
  }

  let body
  try {
    body = await request.json()
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'Invalid request body.' }), {
      status: 400, headers: { 'Content-Type': 'application/json' },
    })
  }

  const { email, name } = body || {}
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!email || !emailRe.test(email)) {
    return new Response(JSON.stringify({ ok: false, error: 'A valid email is required.' }), {
      status: 400, headers: { 'Content-Type': 'application/json' },
    })
  }

  const firstName = (name || '').trim().split(/\s+/)[0] || 'there'

  const html = `
    <div style="font-family:sans-serif;font-size:14px;line-height:1.6;color:#1A1A2E;max-width:520px;margin:0 auto;">
      <p style="font-size:11px;font-weight:700;letter-spacing:.1em;color:#C9A84C;text-transform:uppercase;margin:0 0 16px;">VALORIA INSTITUTE</p>
      <h1 style="font-size:22px;font-weight:400;margin:0 0 16px;">Welcome to Valoria.</h1>
      <p style="margin:0 0 12px;">Hi ${firstName},</p>
      <p style="margin:0 0 12px;">You're in. Your account is ready — here's what to do next:</p>
      <ul style="margin:0 0 16px;padding-left:20px;">
        <li style="margin-bottom:6px;">Browse the marketplace for PRIME-assessed talent, speakers, and facilitators</li>
        <li style="margin-bottom:6px;">Request an introduction to anyone you'd like to connect with — Valoria facilitates every introduction personally</li>
        <li>Check your dashboard any time to track requests you've sent</li>
      </ul>
      <a href="https://valoriainstitute.com/marketplace" style="display:inline-block;margin-top:8px;padding:12px 24px;background:#C9A84C;color:#0F0F1A;text-decoration:none;font-size:12px;font-weight:700;letter-spacing:.08em;">BROWSE THE MARKETPLACE</a>
      <p style="margin:28px 0 0;font-size:12px;color:#8A8578;">— The Valoria Institute team</p>
    </div>`

  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'api-key': BREVO_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sender: { name: FROM_NAME, email: FROM_EMAIL },
        to: [{ email, name: name || undefined }],
        subject: 'Welcome to Valoria Institute',
        htmlContent: html,
        tags: ['welcome-email', 'buyer'],
      }),
    })
    if (!res.ok) {
      const errText = await res.text().catch(() => '')
      console.error('Welcome email failed:', res.status, errText)
      return new Response(JSON.stringify({ ok: false, error: 'Send failed.' }), {
        status: 502, headers: { 'Content-Type': 'application/json' },
      })
    }
    return new Response(JSON.stringify({ ok: true }), {
      status: 200, headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('Welcome email error:', err)
    return new Response(JSON.stringify({ ok: false, error: 'Send failed.' }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    })
  }
}
