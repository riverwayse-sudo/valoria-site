import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const ACKNOWLEDGEMENT_VERSION = 'profile-visibility-v1-2026-11-05'

function getAdmin() {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) return null
  return createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

export async function POST(request) {
  const admin = getAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Profile consent service is temporarily unavailable.' }, { status: 503 })
  }

  const authorization = request.headers.get('authorization') || ''
  const token = authorization.match(/^Bearer\s+(.+)$/i)?.[1]
  if (!token) {
    return NextResponse.json({ error: 'Sign in before submitting your profile.' }, { status: 401 })
  }

  const { data: authData, error: authError } = await admin.auth.getUser(token)
  const user = authData?.user
  if (authError || !user) {
    return NextResponse.json({ error: 'Your session could not be verified. Please sign in again.' }, { status: 401 })
  }
  if (!user.email_confirmed_at) {
    return NextResponse.json({ error: 'Confirm your email before submitting your profile.' }, { status: 403 })
  }

  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'A valid profile consent response is required.' }, { status: 400 })
  }

  if (body?.consent !== true || !['public', 'registered_only'].includes(body?.visibility)) {
    return NextResponse.json({ error: 'Choose a visibility setting and confirm the profile statement.' }, { status: 400 })
  }

  const { data: profile, error: profileError } = await admin
    .from('professional_profiles')
    .select('profile_complete,visibility')
    .eq('id', user.id)
    .maybeSingle()

  if (profileError || !profile?.profile_complete) {
    return NextResponse.json({ error: 'Complete the required professional profile details before submitting.' }, { status: 409 })
  }

  const visibility = body.visibility
  const acknowledgementText = visibility === 'public'
    ? 'I confirm that the information I provided is accurate. I consent to Valoria displaying the public profile fields associated with my professional record in the Valoria Marketplace when the applicable assessment, completeness, capability, review and listing requirements are met. I understand that completing the VALU assessment does not guarantee public listing, and I can change my visibility preference.'
    : 'I confirm that the information I provided is accurate. I choose registered-only visibility for my professional profile. I understand that my profile will not be displayed to public visitors while this setting remains in place, and I can change my visibility preference.'

  // For public visibility, record consent before changing the profile to public.
  // For registered-only visibility, apply the restrictive setting before recording.
  if (visibility === 'registered_only') {
    const { error: visibilityError } = await admin
      .from('professional_profiles')
      .update({ visibility, updated_at: new Date().toISOString() })
      .eq('id', user.id)
    if (visibilityError) {
      console.error('Profile visibility update failed:', visibilityError)
      return NextResponse.json({ error: 'Your visibility preference could not be saved. Please try again.' }, { status: 502 })
    }
  }

  const { error: acknowledgementError } = await admin
    .from('professional_profile_acknowledgements')
    .insert({
      professional_id: user.id,
      acknowledgement_type: 'profile_submission',
      acknowledgement_version: ACKNOWLEDGEMENT_VERSION,
      acknowledgement_text: acknowledgementText,
      source: 'profile_setup',
      acknowledged_at: new Date().toISOString(),
    })

  if (acknowledgementError) {
    console.error('Profile acknowledgement record failed:', acknowledgementError)
    return NextResponse.json({ error: 'Your consent could not be recorded. Your profile has not been submitted.' }, { status: 502 })
  }

  if (visibility === 'public') {
    const { error: visibilityError } = await admin
      .from('professional_profiles')
      .update({ visibility, updated_at: new Date().toISOString() })
      .eq('id', user.id)
    if (visibilityError) {
      console.error('Public profile visibility update failed after consent was recorded:', visibilityError)
      return NextResponse.json({ error: 'Your consent was recorded, but public visibility could not be applied. Please retry submission.' }, { status: 502 })
    }
  }

  return NextResponse.json({
    ok: true,
    visibility,
    acknowledgement_version: ACKNOWLEDGEMENT_VERSION,
  })
}
