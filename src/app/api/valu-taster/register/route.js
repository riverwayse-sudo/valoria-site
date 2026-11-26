import { NextResponse } from 'next/server'
import { randomBytes, createHash } from 'node:crypto'
import { createClient } from '@supabase/supabase-js'
import { validatePassword } from '@/lib/password-policy'

const EXPERIENCE = new Set(['0-3', '4-8', '9-15', '16+'])

function fail(message, status) {
  return NextResponse.json({ error: message }, {
    status,
    headers: { 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer' },
  })
}

export async function POST(request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) return fail('The secure registration service is not configured.', 503)

  let body
  try { body = await request.json() } catch { return fail('Invalid registration request.', 400) }
  const name = String(body?.name || '').trim()
  const role = String(body?.role || '').trim()
  const experience = String(body?.experience || '').trim()
  const email = String(body?.email || '').trim().toLowerCase()
  const password = String(body?.password || '')
  const privacyAcknowledged = body?.privacyAcknowledged === true
  const marketingConsent = body?.marketingConsent === true

  if (!name || name.length > 200 || !role || role.length > 160 ||
      !EXPERIENCE.has(experience) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      email.length > 254 || !privacyAcknowledged) {
    return fail('Check your details and acknowledge the Privacy Notice to continue.', 400)
  }
  const passwordCheck = validatePassword(password)
  if (!passwordCheck.valid) return fail(passwordCheck.errors.join(' '), 400)

  const ip = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const ipKey = createHash('sha256').update(ip).digest('hex')
  try {
    const limited = await fetch(`${url}/rest/v1/rpc/consume_rate_limit`, {
      method: 'POST',
      headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ p_rate_key: `valu-taster-account-create:${ipKey}`, p_limit: 8, p_window_seconds: 3600 }),
      cache: 'no-store',
    })
    if (!limited.ok) throw new Error(`rate-limit:${limited.status}`)
    const result = await limited.json()
    const limit = Array.isArray(result) ? result[0] : result
    if (!limit?.allowed) {
      return NextResponse.json({ error: 'Too many account registration attempts. Please try again later.' }, {
        status: 429,
        headers: { 'Cache-Control': 'no-store', 'Retry-After': String(limit?.retry_after_seconds || 3600) },
      })
    }
  } catch (error) {
    console.error('VALU account registration rate limiter failed:', error?.message || error)
    return fail('Registration is temporarily unavailable. Please try again shortly.', 503)
  }

  const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })
  const metadata = {
    display_name: name,
    full_name: name,
    user_type: 'professional',
    role,
    experience,
    valu_taster_signup: true,
    privacy_acknowledged: true,
    privacy_notice_version: '2026-11-12',
    marketing_consent: marketingConsent,
  }
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: false,
    user_metadata: metadata,
    app_metadata: {
      valu_taster_signup: true,
      privacy_acknowledged: true,
      privacy_notice_version: '2026-11-12',
      consent_source: 'valu_taster_signup',
      role,
      experience,
    },
  })
  if (createError || !created?.user?.id) {
    // Do not disclose whether an email already has an account.
    console.warn('VALU Taster account creation rejected:', createError?.code || 'user_missing')
    return fail('We could not create this account. If you already have a Valoria account, sign in and continue.', 409)
  }

  const handoffCode = randomBytes(32).toString('base64url')
  const tokenHash = createHash('sha256').update(handoffCode).digest('hex')
  const expiresAt = new Date(Date.now() + 60 * 1000).toISOString()
  const { error: handoffError } = await admin.from('valoria_reentry_links').insert({
    user_id: created.user.id,
    token: tokenHash,
    entry_point: 'taster_start',
    target_stage: 'taster',
    source: 'unconfirmed_account_taster_signup',
    source_id: null,
    expires_at: expiresAt,
  })
  if (handoffError) {
    await admin.auth.admin.deleteUser(created.user.id)
    console.error('VALU Taster registration handoff creation failed:', handoffError.message)
    return fail('Your account could not be securely prepared. Please try again.', 503)
  }

  const destination = new URL('/valu/assessment/?journey=account-first', request.url)
  destination.hash = new URLSearchParams({ taster_start_code: handoffCode }).toString()
  return NextResponse.json({ url: destination.toString(), expires_in: 60 }, {
    headers: { 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer' },
  })
}
