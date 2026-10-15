import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SB_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY
function getAdmin() {
  if (!SB_URL || !SERVICE) throw new Error('Supabase server configuration is missing.')
  return createClient(SB_URL, SERVICE, { auth: { persistSession: false, autoRefreshToken: false } })
}

function norm(value) {
  return String(value || '').trim().toLowerCase().replace(/\s+/g, ' ')
}

export async function POST(request) {
  let admin
  try { admin = getAdmin() } catch {
    return NextResponse.json({ error: 'Server misconfigured.' }, { status: 503 })
  }
  if (!SB_URL || !SB_ANON || !SERVICE) {
    return NextResponse.json({ error: 'Server misconfigured.' }, { status: 503 })
  }

  let body
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }
  const { taster_id: tasterId, name, role } = body || {}
  if (!tasterId) return NextResponse.json({ error: 'taster_id is required.' }, { status: 400 })

  const authorization = request.headers.get('authorization') || ''
  if (!authorization.toLowerCase().startsWith('bearer ')) {
    return NextResponse.json({ error: 'Sign in is required before linking your VALU result.' }, { status: 401 })
  }

  const userClient = createClient(SB_URL, SB_ANON, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { data: authData, error: authError } = await userClient.auth.getUser()
  if (authError || !authData?.user) {
    return NextResponse.json({ error: 'Your session could not be verified.' }, { status: 401 })
  }

  const user = authData.user
  const { data: taster, error: tasterError } = await admin
    .from('taster_sessions')
    .select('id,name,role,user_id,linked_at,completed_at')
    .eq('id', tasterId)
    .maybeSingle()

  if (tasterError) return NextResponse.json({ error: 'Could not verify the saved snapshot.' }, { status: 502 })
  if (!taster) return NextResponse.json({ error: 'Snapshot result not found.' }, { status: 404 })
  if (!user.email_confirmed_at) return NextResponse.json({ error: 'Verify your email before linking a saved VALU snapshot.' }, { status: 403 })
  const { data: identityCandidate, error: candidateLookupError } = await admin
    .from('taster_identity_candidates')
    .select('candidate_email,linked_user_id')
    .eq('taster_id', tasterId)
    .maybeSingle()
  if (candidateLookupError) return NextResponse.json({ error: 'Could not verify snapshot identity evidence.' }, { status: 502 })
  if (identityCandidate?.candidate_email && norm(identityCandidate.candidate_email) !== norm(user.email)) {
    return NextResponse.json({ error: 'The saved snapshot email evidence does not match this account. Valoria support must review the identity before linking.' }, { status: 403 })
  }
  if (identityCandidate?.linked_user_id && identityCandidate.linked_user_id !== user.id) {
    return NextResponse.json({ error: 'This snapshot evidence is already connected to another account.' }, { status: 409 })
  }
  if (taster.user_id && taster.user_id !== user.id) {
    return NextResponse.json({ error: 'This snapshot is already linked to another account.' }, { status: 409 })
  }

  const { data: existingProfile, error: profileError } = await admin
    .from('professional_profiles')
    .select('display_name')
    .eq('id', user.id)
    .maybeSingle()
  if (profileError) {
    return NextResponse.json({ error: 'Could not verify the account profile.' }, { status: 502 })
  }

  // Only compare identity fields already stored on the authenticated account.
  // Never trust a name supplied in this request as proof of ownership.
  const accountName = user.user_metadata?.display_name
    || user.user_metadata?.full_name
    || existingProfile?.display_name
    || ''
  if (!accountName || !taster.name || norm(accountName) !== norm(taster.name)) {
    return NextResponse.json({
      error: 'We could not verify this snapshot against the signed-in account. Please use the same account used at signup or contact Valoria support.',
    }, { status: 403 })
  }
  if (role && norm(role) !== norm(taster.role)) {
    return NextResponse.json({ error: 'The account role must match the saved snapshot role.' }, { status: 403 })
  }

  // Conditional update prevents two accounts from claiming the same snapshot.
  if (!taster.user_id) {
    const { data: claimed, error: linkError } = await admin
      .from('taster_sessions')
      .update({ user_id: user.id, linked_at: new Date().toISOString() })
      .eq('id', tasterId)
      .is('user_id', null)
      .select('id,user_id,linked_at')
      .maybeSingle()

    if (linkError) return NextResponse.json({ error: 'Could not link the snapshot.' }, { status: 502 })
    if (!claimed) {
      const { data: current } = await admin.from('taster_sessions')
        .select('id,user_id,linked_at').eq('id', tasterId).maybeSingle()
      if (current?.user_id !== user.id || !current?.linked_at) {
        return NextResponse.json({ error: 'This snapshot was claimed by another account. Refresh and try again.' }, { status: 409 })
      }
    }
  } else if (!taster.linked_at) {
    return NextResponse.json({ error: 'The existing snapshot link is incomplete. Please contact Valoria support.' }, { status: 409 })
  }

  const { error: identityProjectionError } = await admin.from('taster_identity_candidates')
    .update({ identity_status: 'account_linked', linked_user_id: user.id, resolution_notes: 'Claimed through confirmed-email authentication and saved snapshot identity verification.', last_reconciled_at: new Date().toISOString() })
    .eq('taster_id', tasterId).is('linked_user_id', null)
  if (identityProjectionError) return NextResponse.json({ error: 'Snapshot linked, but the identity record could not be updated.' }, { status: 502 })

  // Stitch a completed full assessment to the now-verified account. New submissions
  // normally already carry taster_id; this also repairs the common signup-after-assessment
  // path where the assessment exists but user_id was null at submission time.
  let assessmentLinkStatus = 'no_completed_assessment';
  let assessmentCandidate = null;
  const { data: byTaster, error: byTasterError } = await admin
    .from('valu_assessments')
    .select('id,user_id,taster_id,email,name,role,total_score,completed_at,assessment_version')
    .eq('taster_id', tasterId)
    .not('completed_at', 'is', null)
    .order('completed_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (byTasterError) {
    return NextResponse.json({ error: 'Snapshot linked, but the full assessment could not be checked.' }, { status: 502 })
  }
  assessmentCandidate = byTaster

  if (!assessmentCandidate) {
    const { data: ownedLegacy, error: ownedLegacyError } = await admin
      .from('valu_assessments')
      .select('id,user_id,taster_id,email,name,role,total_score,completed_at,assessment_version')
      .eq('user_id', user.id)
      .is('taster_id', null)
      .not('completed_at', 'is', null)
      .order('completed_at', { ascending: false })
      .limit(10)
    if (ownedLegacyError) {
      return NextResponse.json({ error: 'Snapshot linked, but legacy assessment recovery could not be checked.' }, { status: 502 })
    }
    assessmentCandidate = (ownedLegacy || []).find(a =>
      norm(a.name) === norm(taster.name) && norm(a.role) === norm(taster.role)
    ) || null
  }

  if (assessmentCandidate) {
    if (assessmentCandidate.user_id && assessmentCandidate.user_id !== user.id) {
      // Preserve the taster claim, but never transfer a full assessment from another account.
      assessmentLinkStatus = 'conflict_manual_review'
    } else if (assessmentCandidate.taster_id && assessmentCandidate.taster_id !== tasterId) {
      assessmentLinkStatus = 'conflict_manual_review'
    } else if (norm(assessmentCandidate.name) !== norm(taster.name) || norm(assessmentCandidate.role) !== norm(taster.role)) {
      assessmentLinkStatus = 'identity_mismatch_manual_review'
    } else {
      const { data: existingIdentity, error: identityLookupError } = await admin
        .from('assessment_identity_links')
        .select('assessment_id,user_id')
        .eq('assessment_id', assessmentCandidate.id)
        .maybeSingle()
      if (identityLookupError) {
        return NextResponse.json({ error: 'Assessment linked, but its identity audit record could not be checked.' }, { status: 502 })
      }
      if (existingIdentity && existingIdentity.user_id !== user.id) {
        assessmentLinkStatus = 'conflict_manual_review'
      } else {
        const assessmentPatch = { user_id: user.id }
        if (!assessmentCandidate.taster_id) assessmentPatch.taster_id = tasterId
        let assessmentUpdate = admin.from('valu_assessments')
          .update(assessmentPatch)
          .eq('id', assessmentCandidate.id)
        if (!assessmentCandidate.user_id) assessmentUpdate = assessmentUpdate.is('user_id', null)
        if (!assessmentCandidate.taster_id) assessmentUpdate = assessmentUpdate.is('taster_id', null)
        const { error: assessmentUpdateError } = await assessmentUpdate
        if (assessmentUpdateError) {
          return NextResponse.json({ error: 'Snapshot linked, but the full assessment could not be attached safely.' }, { status: 502 })
        }

        const { data: verifiedAssessment, error: verifyAssessmentError } = await admin
          .from('valu_assessments')
          .select('id,user_id,taster_id')
          .eq('id', assessmentCandidate.id)
          .maybeSingle()
        if (verifyAssessmentError || verifiedAssessment?.user_id !== user.id || verifiedAssessment?.taster_id !== tasterId) {
          assessmentLinkStatus = 'conflict_manual_review'
        } else {
          const { error: identityError } = await admin.from('assessment_identity_links').upsert({
            assessment_id: assessmentCandidate.id,
            user_id: user.id,
            link_method: 'verified_taster_handoff',
            linked_by: user.id,
          }, { onConflict: 'assessment_id' })
          if (identityError) {
            return NextResponse.json({ error: 'Assessment linked, but its identity audit record could not be saved.' }, { status: 502 })
          }
          assessmentLinkStatus = 'linked'
        }
      }
    }
  }

  // Make ordinary retries idempotent. Ownership on taster_sessions is canonical;
  // the event log is supplementary and may already contain a prior successful handoff.
  const { data: priorEvent, error: priorEventError } = await admin
    .from('valoria_journey_events')
    .select('id')
    .eq('user_id', user.id)
    .eq('event_key', 'taster_linked')
    .eq('source', 'taster_session')
    .eq('source_id', tasterId)
    .limit(1)
    .maybeSingle()
  if (priorEventError) {
    return NextResponse.json({ error: 'Snapshot linked, but the journey event could not be checked. Please retry the journey step.' }, { status: 502 })
  }
  if (!priorEvent) {
    const { error: eventError } = await admin.from('valoria_journey_events').insert({
      user_id: user.id,
      event_key: 'taster_linked',
      source: 'taster_session',
      source_id: tasterId,
      metadata: { link_method: 'verified_account_identity_match', completed: !!taster.completed_at },
    })
    if (eventError) {
      return NextResponse.json({ error: 'Snapshot linked, but the journey event could not be recorded. Please retry the journey step.' }, { status: 502 })
    }
  }

  const { data: journey, error: journeyError } = await admin.rpc('refresh_professional_journey', {
    p_user_id: user.id,
  })
  if (journeyError) {
    return NextResponse.json({
      error: 'Snapshot linked, but journey state could not be refreshed. Please retry the journey step.',
    }, { status: 502 })
  }

  return NextResponse.json({
    ok: true,
    next: '/profile/setup',
    continuity: {
      tasterLinked: true,
      journeyRefreshed: true,
      journey,
      assessmentLinkStatus,
      next: '/profile/setup',
    },
  })
}
