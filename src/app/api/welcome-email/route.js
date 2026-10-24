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
//
// SECURITY (audit finding): this route is public by design — the caller has
// just created an account and has no session yet, so requiring a session would
// break the signup journey. Before the fix it mailed any syntactically valid
// address, with no rate limit, no eligibility condition and no duplicate
// protection: an open relay for mail-bombing a third party and for laundering
// spam through Valoria's sending reputation. It also interpolated the
// caller-supplied name straight into the email HTML.
//
// Four controls, applied in this order:
//   1. Per-IP rate limit (5/hour) — blunts bulk sending.
//   2. Per-recipient limit (1/day) — a repeat welcome is a no-op, not a
//      second email.
//   3. Eligibility — the recipient must be the address of an account that was
//      just created (see signupEmailEligible). This is the control that
//      actually closes the relay.
//   4. The name is HTML-escaped and length-capped before interpolation.
//
// The limiter fails OPEN, matching the other public forms in this repo
// (enquiries, waitlist): a limiter outage must not silently drop a real
// signup's welcome email. That is safe here only because the eligibility check
// in step 3 is independent of the limiter and fails closed on its own — an
// arbitrary recipient is refused even if both limits are unavailable.

import { siteUrl } from '@/lib/site-url'
import { getPrivilegedClient } from '@/lib/supabase-server'
import { signupEmailEligible } from '@/lib/api-guard'

const BREVO_KEY = process.env.BREVO_API_KEY
const FROM_EMAIL = 'info@valoriainstitute.com'
const FROM_NAME  = 'Valoria Institute'

const MAX_NAME_LENGTH = 120
const MAX_EMAIL_LENGTH = 254
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const IP_LIMIT_MAX = 5
const IP_LIMIT_WINDOW_SECONDS = 3600
const RECIPIENT_LIMIT_MAX = 1
const RECIPIENT_LIMIT_WINDOW_SECONDS = 86400

function escapeHtml(value) {
  return String(value == null ? '' : value).replace(
    /[&<>'"]/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c])
  )
}

function clientIp(request) {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  )
}

// Returns true when the request is within budget, or when the limiter cannot be
// consulted (fail open — see the header note).
async function withinLimit(key, maxCount, windowSeconds) {
  try {
    const { data, error } = await getPrivilegedClient().rpc('check_rate_limit', {
      p_key: key,
      p_max_count: maxCount,
      p_window_seconds: windowSeconds,
    })
    if (error) {
      console.error('welcome-email rate limit check failed:', error.message || 'unknown')
      return true
    }
    return data !== false
  } catch (err) {
    console.error('welcome-email rate limiter unavailable:', err?.message || 'unknown')
    return true
  }
}

// Looks up the auth user so eligibility can be decided on the account record
// rather than on anything the caller supplied. Returns null on any failure, and
// signupEmailEligible then refuses the request.
async function lookupUser(userId) {
  try {
    const { data, error } = await getPrivilegedClient().auth.admin.getUserById(userId)
    if (error) return null
    return data?.user || null
  } catch {
    return null
  }
}

function json(body, status) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function POST(request) {
  if (!BREVO_KEY) {
    console.error('Welcome email skipped: BREVO_API_KEY not configured.')
    return json({ ok: false, error: 'Email not configured.' }, 501)
  }

  let body
  try {
    body = await request.json()
  } catch {
    return json({ ok: false, error: 'Invalid request body.' }, 400)
  }

  const { email, name, user_id: userId } = body || {}
  if (typeof email !== 'string' || email.length > MAX_EMAIL_LENGTH || !EMAIL_RE.test(email)) {
    return json({ ok: false, error: 'A valid email is required.' }, 400)
  }
  if (name != null && (typeof name !== 'string' || name.length > MAX_NAME_LENGTH)) {
    return json({ ok: false, error: 'Name is too long.' }, 400)
  }

  const normalizedEmail = email.trim().toLowerCase()
  if (!(await withinLimit(`welcome-email-ip:${clientIp(request)}`, IP_LIMIT_MAX, IP_LIMIT_WINDOW_SECONDS))) {
    return json(
      { ok: false, error: 'Too many requests from this connection — please try again later.' },
      429
    )
  }
  if (!(await withinLimit(`welcome-email-to:${normalizedEmail}`, RECIPIENT_LIMIT_MAX, RECIPIENT_LIMIT_WINDOW_SECONDS))) {
    // Already welcomed. Not an error, and deliberately not a resend.
    return json({ ok: true, skipped: 'already_sent' })
  }

  const user = typeof userId === 'string' ? await lookupUser(userId) : null
  if (!signupEmailEligible(user, email)) {
    return json({ ok: false, error: 'No new account matches this address.' }, 403)
  }

  const firstName = escapeHtml((name || '').trim().split(/\s+/)[0] || 'there')

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
      <a href="${siteUrl('/marketplace')}" style="display:inline-block;margin-top:8px;padding:12px 24px;background:#C9A84C;color:#0F0F1A;text-decoration:none;font-size:12px;font-weight:700;letter-spacing:.08em;">BROWSE THE MARKETPLACE</a>
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
      // Provider status only. The response body can echo the recipient address
      // and account details, so it is never logged or returned.
      console.error('Welcome email failed with status', res.status)
      return json({ ok: false, error: 'Send failed.' }, 502)
    }
    return json({ ok: true }, 200)
  } catch (err) {
    console.error('Welcome email error:', err?.message || 'unknown')
    return json({ ok: false, error: 'Send failed.' }, 500)
  }
}
