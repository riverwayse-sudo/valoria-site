import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const norm = value => String(value || '').trim().toLowerCase().replace(/\s+/g, ' ')

export async function POST(request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !anon || !service) return NextResponse.json({ error: 'Server misconfigured.' }, { status: 503 })

  const authorization = request.headers.get('authorization') || ''
  if (!/^Bearer\s+\S+/i.test(authorization)) return NextResponse.json({ error: 'Sign in is required.' }, { status: 401 })
  const userClient = createClient(url, anon, { global: { headers: { Authorization: authorization } }, auth: { persistSession: false, autoRefreshToken: false } })
  const { data: authData, error: authError } = await userClient.auth.getUser()
  const user = authData?.user
  if (authError || !user?.id || !user.email) return NextResponse.json({ error: 'Your session could not be verified.' }, { status: 401 })
  if (!user.email_confirmed_at) return NextResponse.json({ error: 'Verify your email before claiming previous snapshots.' }, { status: 403 })

  const admin = createClient(url, service, { auth: { persistSession: false, autoRefreshToken: false } })
  const email = user.email.trim().toLowerCase()
  const { data: candidates, error: lookupError } = await admin.from('taster_identity_candidates')
    .select('taster_id,candidate_name,candidate_role,identity_status,linked_user_id')
    .eq('candidate_email', email)
    .in('identity_status', ['contact_candidate', 'unresolved', 'account_linked'])
    .limit(50)
  if (lookupError) return NextResponse.json({ error: 'Could not retrieve snapshot recovery records.' }, { status: 502 })

  const linked = []
  const processed = []
  const conflicts = []

  for (const candidate of candidates || []) {
    const tasterId = candidate.taster_id
    if (candidate.linked_user_id && candidate.linked_user_id !== user.id) {
      conflicts.push(tasterId)
      continue
    }

    const { data: taster, error: tasterError } = await admin.from('taster_sessions')
      .select('id,name,role,user_id,linked_at,completed_at')
      .eq('id', tasterId)
      .maybeSingle()
    if (tasterError) return NextResponse.json({ error: 'Could not verify a snapshot record.' }, { status: 502 })
    if (!taster) continue

    if ((taster.user_id && taster.user_id !== user.id)
      || norm(taster.name) !== norm(candidate.candidate_name)
      || norm(taster.role) !== norm(candidate.candidate_role)) {
      conflicts.push(taster.id)
      continue
    }

    // Never override an existing verified decision for a different account.
    const { data: latestReview, error: reviewLookupError } = await admin.from('identity_reconciliation_reviews')
      .select('id,decision,candidate_record_id')
      .eq('source_record_type', 'taster')
      .eq('source_record_id', taster.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (reviewLookupError) return NextResponse.json({ error: 'Could not verify the snapshot review history.' }, { status: 502 })
    if (latestReview?.decision === 'verified_match' && latestReview.candidate_record_id !== user.id) {
      conflicts.push(taster.id)
      continue
    }

    let changed = false
    if (!taster.user_id) {
      const { data: updatedTaster, error: linkError } = await admin.from('taster_sessions')
        .update({ user_id: user.id, linked_at: new Date().toISOString() })
        .eq('id', taster.id)
        .is('user_id', null)
        .select('id,user_id')
        .maybeSingle()
      if (linkError) return NextResponse.json({ error: 'Could not safely link a snapshot.' }, { status: 502 })
      if (!updatedTaster) {
        const { data: current, error: currentError } = await admin.from('taster_sessions')
          .select('id,user_id')
          .eq('id', taster.id)
          .maybeSingle()
        if (currentError) return NextResponse.json({ error: 'Could not verify snapshot ownership after a concurrent claim.' }, { status: 502 })
        if (current?.user_id !== user.id) {
          conflicts.push(taster.id)
          continue
        }
      } else {
        changed = true
      }
    }

    if (!candidate.linked_user_id) {
      const { data: updatedCandidate, error: candidateError } = await admin.from('taster_identity_candidates')
        .update({
          identity_status: 'account_linked',
          linked_user_id: user.id,
          resolution_notes: 'Claimed by authenticated account with confirmed email matching corroborated contact candidate; saved snapshot name and role revalidated. Original snapshot preserved.',
          last_reconciled_at: new Date().toISOString(),
        })
        .eq('taster_id', taster.id)
        .is('linked_user_id', null)
        .select('taster_id')
        .maybeSingle()
      if (candidateError) return NextResponse.json({ error: 'Snapshot linked, but its reconciliation record could not be finalized.' }, { status: 502 })
      if (!updatedCandidate) {
        const { data: currentCandidate, error: currentCandidateError } = await admin.from('taster_identity_candidates')
          .select('linked_user_id,identity_status')
          .eq('taster_id', taster.id)
          .maybeSingle()
        if (currentCandidateError) return NextResponse.json({ error: 'Could not verify the snapshot reconciliation state.' }, { status: 502 })
        if (currentCandidate?.linked_user_id !== user.id) {
          conflicts.push(taster.id)
          continue
        }
      } else {
        changed = true
      }
    } else if (candidate.identity_status !== 'account_linked') {
      const { error: statusError } = await admin.from('taster_identity_candidates')
        .update({
          identity_status: 'account_linked',
          resolution_notes: 'Reconciled by authenticated account with confirmed email matching corroborated contact candidate; saved snapshot name and role revalidated. Original snapshot preserved.',
          last_reconciled_at: new Date().toISOString(),
        })
        .eq('taster_id', taster.id)
        .eq('linked_user_id', user.id)
      if (statusError) return NextResponse.json({ error: 'Snapshot ownership is valid, but its reconciliation status could not be repaired.' }, { status: 502 })
      changed = true
    }

    // Append a new decision instead of overwriting the prior unmatched/conflict history.
    if (!(latestReview?.decision === 'verified_match' && latestReview.candidate_record_id === user.id)) {
      const { error: auditError } = await admin.from('identity_reconciliation_reviews').insert({
        source_record_type: 'taster',
        source_record_id: taster.id,
        candidate_record_type: 'account',
        candidate_record_id: user.id,
        decision: 'verified_match',
        evidence_type: 'authenticated_account',
        evidence_reference: 'Confirmed account email matched the corroborated contact candidate; saved taster name and role revalidated.',
        notes: 'Claim completed or repaired by the authenticated account. Historical answers, score, timestamps, and version provenance unchanged.',
        review_actor_type: 'system',
        reviewed_by: null,
        reviewed_at: new Date().toISOString(),
      })
      if (auditError) return NextResponse.json({ error: 'Snapshot linked, but its audit record could not be finalized. Retry the recovery step.' }, { status: 502 })
      changed = true
    }

    processed.push(taster.id)
    if (changed) linked.push(taster.id)
  }

  // Retry journey/readiness refresh even when the snapshot and candidate were already
  // linked: a previous request may have failed after persistence but before these RPCs.
  if (processed.length) {
    const { error: journeyError } = await admin.rpc('refresh_professional_journey', { p_user_id: user.id })
    if (journeyError) return NextResponse.json({ error: 'Snapshot linked, but journey state needs a retry.' }, { status: 502 })
    const { error: readinessError } = await admin.rpc('sync_professional_listing_status', { p_professional_id: user.id })
    if (readinessError) return NextResponse.json({ error: 'Snapshot linked, but marketplace readiness needs a retry.' }, { status: 502 })
  }

  return NextResponse.json({
    ok: true,
    linked: linked.length,
    reconciled: processed.length,
    conflicts: conflicts.length,
    taster_ids: linked,
  }, { headers: { 'Cache-Control': 'no-store' } })
}
