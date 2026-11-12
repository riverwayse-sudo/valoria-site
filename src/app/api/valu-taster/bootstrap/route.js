import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { normalizeSupabaseProjectUrl } from '@/lib/supabase-url'
import { createHash, createHmac } from 'node:crypto'

const CONFIGURED_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_URL = CONFIGURED_SUPABASE_URL ? normalizeSupabaseProjectUrl(CONFIGURED_SUPABASE_URL) : null
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

function norm(value) {
  return String(value || '').trim().toLowerCase().replace(/\s+/g, ' ')
}
function validToken(value) {
  return typeof value === 'string' && /^[A-Za-z0-9_-]{40,64}$/.test(value)
}

export async function POST(request) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'The registration service is not configured.' }, { status: 503 })
  }

  const cookieUpdates = []
  const userClient = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: values => cookieUpdates.push(...values),
    },
  })
  const { data: authData, error: authError } = await userClient.auth.getUser()
  const user = authData?.user
  if (authError || !user) {
    return NextResponse.json({ error: 'Create or sign in to your Valoria account before beginning the Taster.' }, {
      status: 401, headers: { 'Cache-Control': 'no-store' },
    })
  }
  if (!user.email_confirmed_at) {
    return NextResponse.json({ error: 'Confirm your email address before beginning the Taster.' }, {
      status: 403, headers: { 'Cache-Control': 'no-store' },
    })
  }

  const metadata = user.user_metadata || {}
  const name = String(metadata.full_name || metadata.display_name || '').trim()
  const role = String(metadata.role || '').trim()
  const experience = String(metadata.experience || '').trim()
  const email = String(user.email || '').trim().toLowerCase()
  if (metadata.valu_taster_signup !== true || !name || !role || !experience || metadata.privacy_acknowledged !== true || !email) {
    return NextResponse.json({ error: 'Complete your professional details before beginning the Taster.' }, {
      status: 409, headers: { 'Cache-Control': 'no-store' },
    })
  }

  let body = {}
  try { body = await request.json() } catch {}
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const stableResumeToken = createHmac('sha256', SERVICE_ROLE_KEY)
    .update(`valu-taster-resume:${user.id}`)
    .digest('base64url')
  let resumeToken = stableResumeToken
  let existing = null

  // Only reuse a caller-supplied token when it already identifies a saved
  // session. New sessions always use the stable account-derived token, so a
  // client cannot create unlimited parallel Taster records by changing storage.
  if (validToken(body.resume_token)) {
    const candidateHash = createHash('sha256').update(body.resume_token).digest('hex')
    const { data: candidate, error: candidateError } = await admin
      .from('taster_progress')
      .select('id,name,role,experience,email,lead_capture_id,expires_at')
      .eq('resume_token_hash', candidateHash)
      .maybeSingle()
    if (candidateError) {
      return NextResponse.json({ error: 'Your saved Taster session could not be checked.' }, { status: 502 })
    }
    if (candidate) {
      existing = candidate
      resumeToken = body.resume_token
    }
  }

  if (!existing) {
    const stableHash = createHash('sha256').update(stableResumeToken).digest('hex')
    const { data: stableProgress, error: stableError } = await admin
      .from('taster_progress')
      .select('id,name,role,experience,email,lead_capture_id,expires_at')
      .eq('resume_token_hash', stableHash)
      .maybeSingle()
    if (stableError) {
      return NextResponse.json({ error: 'Your saved Taster session could not be checked.' }, { status: 502 })
    }
    existing = stableProgress || null
  }

  const resumeHash = createHash('sha256').update(resumeToken).digest('hex')
  if (existing && (
    norm(existing.email) !== norm(email) ||
    norm(existing.name) !== norm(name) ||
    norm(existing.role) !== norm(role) ||
    norm(existing.experience) !== norm(experience)
  )) {
    return NextResponse.json({ error: 'This saved Taster belongs to different registration details. Valoria support must review it.' }, { status: 409 })
  }

  let leadCaptureId = existing?.lead_capture_id || null
  let progressId = existing?.id || null
  if (!existing || !existing.lead_capture_id) {
    const { data: registration, error: registrationError } = await admin.rpc('begin_valu_taster_signup', {
      p_signup_key: user.id,
      p_resume_token_hash: resumeHash,
      p_name: name,
      p_email: email,
      p_role: role,
      p_experience: experience,
      p_organisation: String(metadata.organisation || '').trim() || null,
      p_interest: String(metadata.interest || '').trim() || null,
      p_marketing_consent: metadata.marketing_consent === true,
      p_privacy_acknowledged: true,
      p_utm_source: null,
      p_utm_medium: null,
      p_utm_campaign: null,
    })
    if (registrationError) {
      console.error('VALU Taster bootstrap failed:', registrationError.message)
      return NextResponse.json({ error: 'We could not prepare your Taster session. Please retry.' }, { status: 502 })
    }
    const row = Array.isArray(registration) ? registration[0] : registration
    if (!row?.lead_capture_id || !row?.progress_id) {
      return NextResponse.json({ error: 'Your Taster registration could not be verified.' }, { status: 502 })
    }
    leadCaptureId = row.lead_capture_id
    progressId = row.progress_id
  }

  const response = NextResponse.json({
    registered: true,
    resume_token: resumeToken,
    signup_key: user.id,
    lead_capture_id: leadCaptureId,
    progress_id: progressId,
  }, { headers: { 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer' } })
  cookieUpdates.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
  return response
}
