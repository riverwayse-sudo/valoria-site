import { NextResponse } from 'next/server'
import { createHash, randomBytes } from 'node:crypto'
import { createClient } from '@supabase/supabase-js'

const HANDOFF_TTL_SECONDS = 60

function responseError(message, status) {
  return NextResponse.json({ error: message }, {
    status,
    headers: { 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer' },
  })
}

export async function POST(request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !anonKey || !serviceRoleKey) {
    return responseError('The secure Taster service is not configured.', 503)
  }

  const accessToken = (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '').trim()
  if (!accessToken) return responseError('Sign in to your confirmed Valoria account before beginning the Taster.', 401)

  const verifier = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } })
  const { data, error } = await verifier.auth.getUser(accessToken)
  const user = data?.user
  if (error || !user) return responseError('Your Valoria session is invalid. Sign in again.', 401)
  if (!user.email_confirmed_at || !user.email) {
    return responseError('Confirm your Valoria email address before beginning the Taster.', 403)
  }

  const metadata = user.user_metadata || {}
  const name = String(metadata.full_name || metadata.display_name || '').trim()
  const role = String(metadata.role || '').trim()
  const experience = String(metadata.experience || '').trim()
  if (
    metadata.valu_taster_signup !== true ||
    metadata.privacy_acknowledged !== true ||
    !name || !role || !experience
  ) {
    return responseError('Complete your professional account details before beginning the Taster.', 409)
  }

  const admin = createClient(url, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } })
  const consentedAt = new Date().toISOString()
  const { data: updatedUser, error: metadataError } = await admin.auth.admin.updateUserById(user.id, {
    app_metadata: {
      ...(user.app_metadata || {}),
      valu_taster_signup: true,
      privacy_acknowledged: true,
      privacy_acknowledged_at: consentedAt,
      privacy_notice_version: '2026-11-12',
      consent_source: 'valu_taster_signup',
      role,
      experience,
    },
  })
  if (metadataError || !updatedUser?.user) {
    console.error('VALU Taster consent snapshot failed:', metadataError?.message || 'Updated user record missing')
    return responseError('We could not securely record your account acknowledgement. Please try again.', 503)
  }
  const accountMetadata = updatedUser.user.app_metadata || {}
  if (accountMetadata.privacy_acknowledged !== true || accountMetadata.valu_taster_signup !== true) {
    return responseError('Your account acknowledgement could not be verified. Please try again.', 503)
  }

  const { data: completedTaster, error: completedTasterError } = await admin.from('taster_sessions')
    .select('id')
    .eq('user_id', user.id)
    .not('completed_at', 'is', null)
    .limit(1)
    .maybeSingle()
  if (completedTasterError) {
    console.error('VALU Taster completion lookup failed:', completedTasterError.message)
    return responseError('We could not verify your existing VALU journey. Please return to your dashboard and try again.', 503)
  }
  if (completedTaster) {
    const dashboard = new URL('/dashboard?welcome=profile', request.url)
    return NextResponse.json({ url: dashboard.toString(), already_completed: true }, {
      headers: { 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer' },
    })
  }

  const handoffCode = randomBytes(32).toString('base64url')
  const tokenHash = createHash('sha256').update(handoffCode).digest('hex')
  const expiresAt = new Date(Date.now() + HANDOFF_TTL_SECONDS * 1000).toISOString()
  const { error: insertError } = await admin.from('valoria_reentry_links').insert({
    user_id: user.id,
    token: tokenHash,
    entry_point: 'taster_start',
    target_stage: 'taster',
    source: 'confirmed_account_taster_signup',
    source_id: null,
    expires_at: expiresAt,
  })

  if (insertError) {
    console.error('VALU Taster-start handoff issuance failed:', insertError.message)
    return responseError('Secure Taster access is temporarily unavailable. Please try again.', 503)
  }

  const destination = new URL('/valu/assessment/', request.url)
  destination.hash = new URLSearchParams({ taster_start_code: handoffCode }).toString()
  return NextResponse.json({
    url: destination.toString(),
    expires_in: HANDOFF_TTL_SECONDS,
  }, {
    headers: { 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer' },
  })
}
