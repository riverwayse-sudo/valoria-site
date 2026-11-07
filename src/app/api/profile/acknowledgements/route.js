import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import {
  PUBLIC_PROFILE_ACKNOWLEDGEMENT_VERSION,
  REGISTERED_PROFILE_ACKNOWLEDGEMENT_VERSION,
  PUBLIC_PROFILE_CONSENT_TEXT,
  REGISTERED_PROFILE_CONSENT_TEXT,
} from '@/lib/profile-consent-copy'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

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
    .select('profile_complete,visibility,display_name,headline,current_job_title,is_test,revoked_at,listing_status')
    .eq('id', user.id)
    .maybeSingle()

  if (profileError || !profile) {
    return NextResponse.json({ error: 'Your professional profile could not be verified.' }, { status: 409 })
  }
  if (profile.is_test === true || profile.revoked_at) {
    return NextResponse.json({ error: 'This profile is not eligible for public submission.' }, { status: 403 })
  }

  const visibility = body.visibility
  const acknowledgementSource = body.source === 'profile_edit' ? 'profile_edit' : 'profile_setup'
  const acknowledgementVersion = visibility === 'public' ? PUBLIC_PROFILE_ACKNOWLEDGEMENT_VERSION : REGISTERED_PROFILE_ACKNOWLEDGEMENT_VERSION
  const acknowledgementText = visibility === 'public' ? PUBLIC_PROFILE_CONSENT_TEXT : REGISTERED_PROFILE_CONSENT_TEXT

  if (visibility === 'public') {
    // Refresh the canonical Basic/Full tier before checking whether this profile
    // can be published. The refresh function keeps unconsented profiles private.
    const { error: readinessError } = await admin.rpc('sync_professional_listing_status', {
      p_professional_id: user.id,
    })
    if (readinessError) {
      console.error('Profile listing readiness refresh failed:', readinessError)
      return NextResponse.json({ error: 'Your listing eligibility could not be verified. Please try again.' }, { status: 502 })
    }

    const [{ data: currentProfile, error: currentProfileError }, { data: roster, error: rosterError }, { data: taster, error: tasterError }] = await Promise.all([
      admin.from('professional_profiles')
        .select('profile_complete,display_name,headline,current_job_title,listing_status,revoked_at,is_test')
        .eq('id', user.id)
        .maybeSingle(),
      admin.from('marketplace_public_roster')
        .select('assessment_access,full_name,headline,current_job_title')
        .eq('professional_id', user.id)
        .maybeSingle(),
      admin.from('taster_sessions')
        .select('id')
        .eq('user_id', user.id)
        .not('completed_at', 'is', null)
        .limit(1)
        .maybeSingle(),
    ])

    if (currentProfileError || rosterError || tasterError) {
      return NextResponse.json({ error: 'Your Basic or Full listing status could not be verified.' }, { status: 502 })
    }

    const basicEligible = roster?.assessment_access === 'basic' && Boolean(taster)
    const fullEligible = roster?.assessment_access === 'full' && currentProfile?.profile_complete === true
    const displayName = currentProfile?.display_name?.trim() || roster?.full_name?.trim()
    const headline = currentProfile?.headline?.trim()
      || currentProfile?.current_job_title?.trim()
      || roster?.headline?.trim()
      || roster?.current_job_title?.trim()
    const identityReady = Boolean(displayName && headline)
    const listingReady = currentProfile?.listing_status === 'listed'
      && currentProfile?.is_test === false
      && !currentProfile?.revoked_at

    if (!(listingReady && identityReady && (basicEligible || fullEligible))) {
      return NextResponse.json({
        error: 'Your profile is not yet ready for public listing. Basic listing requires a linked completed taster and a verified professional identity; Full listing requires a complete Full VALU profile.',
      }, { status: 409 })
    }
  }

  // Registered-only is applied before recording the preference. Public consent
  // is recorded first; the canonical readiness function then applies public
  // visibility only if this is the latest consent preference.
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
      acknowledgement_version: acknowledgementVersion,
      acknowledgement_text: acknowledgementText,
      source: acknowledgementSource,
      acknowledged_at: new Date().toISOString(),
    })

  if (acknowledgementError) {
    console.error('Profile acknowledgement record failed:', acknowledgementError)
    return NextResponse.json({ error: 'Your consent could not be recorded. Your profile has not been submitted.' }, { status: 502 })
  }

  const { data: readiness, error: readinessError } = await admin.rpc('sync_professional_listing_status', {
    p_professional_id: user.id,
  })
  if (readinessError || readiness?.ok !== true) {
    console.error('Profile visibility/readiness reconciliation failed:', readinessError)
    return NextResponse.json({ error: 'Your preference was recorded, but listing visibility could not be refreshed. Please retry submission.' }, { status: 502 })
  }

  const { data: roster, error: rosterError } = await admin
    .from('marketplace_public_roster')
    .select('assessment_access')
    .eq('professional_id', user.id)
    .maybeSingle()
  if (rosterError) {
    console.error('Profile tier verification after consent failed:', rosterError)
    return NextResponse.json({ error: 'Your preference was saved, but your listing tier could not be verified.' }, { status: 502 })
  }

  return NextResponse.json({
    ok: true,
    visibility,
    listing_status: readiness?.listing_status || null,
    assessment_access: roster?.assessment_access || null,
    acknowledgement_version: acknowledgementVersion,
  })
}
