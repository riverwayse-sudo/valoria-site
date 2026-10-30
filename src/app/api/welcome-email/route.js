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
// This route is public: the caller has just created an account and has no
// session yet. It is therefore gated on evidence that the account was just
// created and that the recipient is that account's own address, rather than
// on a session. Before this it mailed any syntactically valid address.

import { createClient } from '@supabase/supabase-js'
import { signupEmailEligible } from '@/lib/api-guard'

const BREVO_KEY = process.env.BREVO_API_KEY
const FROM_EMAIL = 'info@valoriainstitute.com'
const FROM_NAME  = 'Valoria Institute'
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

function getSupabase() {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) throw new Error('Supabase server configuration is missing.')
  return createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } })
}

function clientIp(request) {
  return request.headers.get('x-forwarded-for')?.split(',')[0].trim()
    || request.headers.get('x-real-ip')
    || 'unknown'
}

async function withinLimit(key, maxCount, windowSeconds) {
  try {
    const supabase = getSupabase()
    const { data: allowed, error } = await supabase.rpc('check_rate_limit', {
      p_key: key, p_max_count: maxCount, p_window_seconds: windowSeconds,
    })
    // Fail open, matching the other public forms in this repo: a broken limiter
    // must not silently drop a real signup's welcome email.
    if (error) { console.error('welcome-email rate limit check failed'); return true }
    return allowed !== false
  } catch {
    return true
  }
}

async function lookupUser(userId) {
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${encodeURIComponent(userId)}`, {
      headers: { apikey: SERVICE_ROLE_KEY, Authorization: `Bearer ${SERVICE_ROLE_KEY}` },
      cache: 'no-store',
    })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

export async function POST(request) {
  if (!BREVO_KEY) {
    console.error('Welcome email skipped: BREVO_API_KEY not configured.')
    return Response.json({ ok: false, error: 'Email not configured.' }, { status: 501 })
  }
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.error('Welcome email skipped: Supabase server configuration is missing.')
    return Response.json({ ok: false, error: 'Email not configured.' }, { status: 501 })
  }

  let body
  try {
    body = await request.json()
  } catch {
    return Response.json({ ok: false, error: 'Invalid request body.' }, { status: 400 })
  }

  const { email, name, user_id: userId } = body || {}
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!email || !emailRe.test(email)) {
    return Response.json({ ok: false, error: 'A valid email is required.' }, { status: 400 })
  }

  // Abuse controls. IP limits bulk sending; the per-recipient key makes a
  // duplicate welcome for the same address a no-op rather than a repeat email.
  if (!await withinLimit(`welcome-email-ip:${clientIp(request)}`, 5, 3600)) {
    return Response.json({ ok: false, error: 'Too many requests from this connection — please try again later.' }, { status: 429 })
  }
  if (!await withinLimit(`welcome-email-to:${email.trim().toLowerCase()}`, 1, 86400)) {
    return Response.json({ ok: true, skipped: 'already_sent' })
  }

  // Eligibility: the address must belong to an account that was just created.
  // Without this the route is an open relay for arbitrary recipients.
  const user = userId ? await lookupUser(userId) : null
  if (!signupEmailEligible(user, email)) {
    return Response.json({ ok: false, error: 'No new account matches this address.' }, { status: 403 })
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
      // Provider status only — never echo the response body, which can contain
      // the recipient address or account details.
      console.error('Welcome email failed with status', res.status)
      return Response.json({ ok: false, error: 'Send failed.' }, { status: 502 })
    }
    return Response.json({ ok: true }, { status: 200 })
  } catch (err) {
    console.error('Welcome email error:', err?.message || 'unknown')
    return Response.json({ ok: false, error: 'Send failed.' }, { status: 500 })
  }
}
