import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const ACKNOWLEDGEMENT_TYPE = 'profile_submission'
const ACKNOWLEDGEMENT_VERSION = 'profile-submission-v1'
const ACKNOWLEDGEMENT_TEXT = 'I confirm all information provided is accurate. I understand that completing VALU establishes my marketplace listing, while completing my professional profile unlocks additional visibility and opportunities.'

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  return url && key
    ? createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
    : null
}

export async function POST(request) {
  const db = adminClient()
  if (!db) {
    return NextResponse.json({ error: 'Profile acknowledgement service is temporarily unavailable.' }, { status: 503 })
  }

  const token = request.headers.get('authorization')?.match(/^Bearer\s+(.+)$/i)?.[1]
  if (!token) {
    return NextResponse.json({ error: 'Sign in before submitting your professional profile.' }, { status: 401 })
  }

  const { data: { user }, error: authError } = await db.auth.getUser(token)
  if (authError || !user) {
    return NextResponse.json({ error: 'Your session could not be verified. Please sign in again.' }, { status: 401 })
  }
  if (!user.email_confirmed_at) {
    return NextResponse.json({ error: 'Confirm your email before submitting your professional profile.' }, { status: 403 })
  }

  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'A valid profile acknowledgement is required.' }, { status: 400 })
  }
  if (body?.acknowledged !== true) {
    return NextResponse.json({ error: 'Confirm the profile submission acknowledgement before continuing.' }, { status: 400 })
  }

  const { data: profile, error: profileError } = await db
    .from('professional_profiles')
    .select('id,profile_complete')
    .eq('id', user.id)
    .maybeSingle()

  if (profileError) {
    console.error('Profile acknowledgement ownership check failed:', profileError)
    return NextResponse.json({ error: 'Your professional profile could not be verified.' }, { status: 500 })
  }
  if (!profile) {
    return NextResponse.json({ error: 'Create your professional profile before submitting the acknowledgement.' }, { status: 404 })
  }
  if (!profile.profile_complete) {
    return NextResponse.json({ error: 'Complete the required professional profile details before submitting.' }, { status: 409 })
  }

  const { data: acknowledgement, error: insertError } = await db
    .from('professional_profile_acknowledgements')
    .insert({
      professional_id: user.id,
      acknowledgement_type: ACKNOWLEDGEMENT_TYPE,
      acknowledgement_version: ACKNOWLEDGEMENT_VERSION,
      acknowledgement_text: ACKNOWLEDGEMENT_TEXT,
      source: 'profile_setup',
    })
    .select('id,acknowledgement_version,acknowledged_at')
    .single()

  if (insertError) {
    console.error('Profile acknowledgement could not be recorded:', insertError)
    return NextResponse.json({ error: 'Your profile was saved, but the acknowledgement could not be recorded. Please retry.' }, { status: 502 })
  }

  return NextResponse.json({ ok: true, acknowledgement }, { status: 201 })
}
