import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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
    .select('taster_id,candidate_name,candidate_role')
    .eq('candidate_email', email).in('identity_status', ['contact_candidate', 'unresolved']).is('linked_user_id', null).limit(50)
  if (lookupError) return NextResponse.json({ error: 'Could not retrieve snapshot recovery records.' }, { status: 502 })
  const linked = [], conflicts = []

  for (const c of candidates || []) {
    const { data: t, error } = await admin.from('taster_sessions')
      .select('id,name,role,user_id').eq('id', c.taster_id).maybeSingle()
    if (error) return NextResponse.json({ error: 'Could not verify a snapshot record.' }, { status: 502 })
    if (!t) continue
    const norm = v => String(v || '').trim().toLowerCase().replace(/\s+/g, ' ')
    if ((t.user_id && t.user_id !== user.id) || norm(t.name) !== norm(c.candidate_name) || norm(t.role) !== norm(c.candidate_role)) {
      conflicts.push(t.id); continue
    }
    if (!t.user_id) {
      const { data: updated, error: linkError } = await admin.from('taster_sessions')
        .update({ user_id: user.id, linked_at: new Date().toISOString() }).eq('id', t.id).is('user_id', null).select('id,user_id').maybeSingle()
      if (linkError) return NextResponse.json({ error: 'Could not safely link a snapshot.' }, { status: 502 })
      if (!updated || updated.user_id !== user.id) { conflicts.push(t.id); continue }
    }
    const { data: updatedCandidate, error: candidateError } = await admin.from('taster_identity_candidates')
      .update({ identity_status: 'account_linked', linked_user_id: user.id, resolution_notes: 'Claimed by authenticated account with confirmed email matching corroborated contact candidate; original snapshot preserved.', last_reconciled_at: new Date().toISOString() })
      .eq('taster_id', t.id).is('linked_user_id', null).select('taster_id').maybeSingle()
    if (candidateError || !updatedCandidate) return NextResponse.json({ error: 'Snapshot linked, but its reconciliation record could not be finalized.' }, { status: 502 })
    const { data: review } = await admin.from('identity_reconciliation_reviews').select('id')
      .eq('source_record_type', 'taster').eq('source_record_id', t.id).eq('decision', 'unmatched').limit(1).maybeSingle()
    const reviewData = { candidate_record_type: 'account', candidate_record_id: user.id, decision: 'verified_match', evidence_type: 'authenticated_account', evidence_reference: 'Confirmed email matched corroborated contact candidate; saved taster name and role revalidated.', notes: 'Claim completed by authenticated account. Historical answers, score, timestamps, and version provenance unchanged.', review_actor_type: 'system', reviewed_by: null, reviewed_at: new Date().toISOString() }
    const audit = review
      ? await admin.from('identity_reconciliation_reviews').update(reviewData).eq('id', review.id)
      : await admin.from('identity_reconciliation_reviews').insert({ source_record_type: 'taster', source_record_id: t.id, ...reviewData })
    if (audit.error) return NextResponse.json({ error: 'Snapshot linked, but its audit record could not be finalized.' }, { status: 502 })
    linked.push(t.id)
  }

  if (linked.length) {
    const { error: journeyError } = await admin.rpc('refresh_professional_journey', { p_user_id: user.id })
    if (journeyError) return NextResponse.json({ error: 'Snapshot linked, but journey state needs a retry.' }, { status: 502 })
    const { error: readinessError } = await admin.rpc('sync_professional_listing_status', { p_professional_id: user.id })
    if (readinessError) return NextResponse.json({ error: 'Snapshot linked, but marketplace readiness needs a retry.' }, { status: 502 })
  }
  return NextResponse.json({ ok: true, linked: linked.length, conflicts: conflicts.length, taster_ids: linked }, { headers: { 'Cache-Control': 'no-store' } })
}
