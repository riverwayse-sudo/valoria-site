// src/app/api/welcome-email/route.js
//
// Sends a Valoria-branded welcome email to new buyer accounts right after
// signup — separate from Supabase's own bare confirmation-link email, which has
// no branding or context. Buyers had no welcome treatment of any kind before
// this; only the waitlist flow ever sent anything.
//
// Professionals aren't included here — they already get a "Welcome, {name}."
// branded email (with their score and a Complete Your Profile CTA) as part of
// report delivery in the assessment app's send-email.js. A second one would
// just be redundant.
//
// SECURITY (audit finding). This route is unauthenticated by design — the
// caller is the signup page, which has no session yet, so requiring a session
// would break the legitimate workflow. Three controls keep it from being an
// open mail relay:
//
//   1. Recipient binding. The address must belong to an account that was just
//      created. The caller sends the id returned by supabase.auth.signUp, and
//      the server confirms the account exists, was created moments ago, and
//      owns the requested address. Without this, any reachable caller could
//      mail an address of their choosing.
//   2. A per-IP rate limit (fail CLOSED), reusing the site's existing
//      check_rate_limit RPC. Unlike a buyer's enquiry, a message that is never
//      sent costs nothing and is recoverable, so an unavailable limiter must
//      not become an open relay.
//   3. A per-recipient limit, so a repeat request for the same new account is a
//      no-op instead of a second email.
//
// The recipient's name is interpolated into the email HTML, so it is escaped.

import { getPrivilegedClient } from '@/lib/supabase-server'
import { siteUrl } from '@/lib/site-url'
import { signupEmailEligible } from '@/lib/api-guard'

const BREVO_KEY = process.env.BREVO_API_KEY
const FROM_EMAIL = 'info@valoriainstitute.com'
const FROM_NAME  = 'Valoria Institute'

// Matches the caps the other public forms enforce; keeps a hostile caller from
// pushing an oversized payload through to the email provider.
const MAX_NAME_LENGTH = 120
const MAX_EMAIL_LENGTH = 254
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Per-IP ceiling per hour. A buyer sends this once, so the limit only bites on abuse.
const RATE_LIMIT_MAX = 5
const RATE_LIMIT_WINDOW_SECONDS = 3600
// One welcome per address per day. A duplicate request is a no-op, not a resend.
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

// Returns { allowed: true } only when the limiter actually confirmed the request
// is within budget. Any other outcome (no credentials, RPC error, budget
// exhausted) is reported as not allowed, so an unavailable limiter fails closed.
async function withinRateLimit(supabase, key, maxCount, windowSeconds) {
  try {
    const { data, error } = await supabase.rpc('check_rate_limit', {
      p_key: key,
      p_max_count: maxCount,
      p_window_seconds: windowSeconds,
    })
    if (error) {
      console.error('Welcome email rate limit check failed:', error)
      return { allowed: false, exhausted: false }
    }
    return { allowed: Boolean(data), exhausted: !data }
  } catch (err) {
    console.error('Welcome email rate limit check threw:', err)
    return { allowed: false, exhausted: false }
  }
}

// The auth user record for the account that just signed up. Returns null on any
// failure so the caller fails closed rather than mailing an unverified address.
async function lookupUser(supabase, userId) {
  try {
    const { data, error } = await supabase.auth.admin.getUserById(userId)
    if (error || !data?.user) return null
    return data.user
  } catch (err) {
    console.error('Welcome email account lookup failed:', err?.message || err)
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

  let supabase
  try {
    supabase = getPrivilegedClient()
  } catch (err) {
    console.error('Welcome email skipped:', err.message)
    return json({ ok: false, error: 'Email service temporarily unavailable.' }, 503)
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
  if (typeof userId !== 'string' || !userId.trim()) {
    return json({ ok: false, error: 'A valid account reference is required.' }, 400)
  }

  // Abuse controls first, so an unauthorised caller cannot reach the provider
  // or the account lookup at volume.
  const ipRate = await withinRateLimit(
    supabase, `welcome-email-ip:${clientIp(request)}`, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_SECONDS
  )
  if (!ipRate.allowed) {
    if (ipRate.exhausted) {
      return json({ ok: false, error: 'Too many requests from this connection — please try again later.' }, 429)
    }
    return json({ ok: false, error: 'Email service temporarily unavailable.' }, 503)
  }

  const recipientRate = await withinRateLimit(
    supabase, `welcome-email-to:${email.trim().toLowerCase()}`, 1, RECIPIENT_LIMIT_WINDOW_SECONDS
  )
  if (!recipientRate.allowed) {
    if (recipientRate.exhausted) {
      // Already welcomed this address today. Treat as success so the signup
      // journey is unaffected, but send nothing.
      return json({ ok: true, skipped: 'already_sent' }, 200)
    }
    return json({ ok: false, error: 'Email service temporarily unavailable.' }, 503)
  }

  // Recipient binding: the address must belong to an account created moments ago.
  const user = await lookupUser(supabase, userId)
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
      // Provider status only. The response body can echo the recipient address,
      // so it is never logged or returned.
      console.error('Welcome email failed with status', res.status)
      return json({ ok: false, error: 'Send failed.' }, 502)
    }
    return json({ ok: true }, 200)
  } catch (err) {
    console.error('Welcome email error:', err?.message || err)
    return json({ ok: false, error: 'Send failed.' }, 500)
  }
}
