import { NextResponse } from 'next/server'
import { createHash, randomBytes } from 'node:crypto'
import { createClient } from '@supabase/supabase-js'

const ASSESSMENT_ORIGIN = 'https://assessment.valoriainstitute.com/'
const HANDOFF_TTL_SECONDS = 60

function getAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase server configuration is missing.')
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}

async function getAccount(request, admin) {
  const token = (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '').trim()
  if (!token) return { error: NextResponse.json({ error: 'Authentication required.' }, { status: 401 }) }
  const { data, error } = await admin.auth.getUser(token)
  if (error || !data?.user) return { error: NextResponse.json({ error: 'Your session is invalid. Sign in again.' }, { status: 401 }) }
  if (!data.user.email_confirmed_at) return { error: NextResponse.json({ error: 'Confirm your email before continuing.' }, { status: 403 }) }
  return { user: data.user }
}

async function getOwnedSnapshot(admin, user) {
  const { data: taster, error } = await admin.from('taster_sessions')
    .select('id,name,role,experience,completed_at')
    .eq('user_id', user.id)
    .not('completed_at', 'is', null)
    .order('completed_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) return { error: 'Could not verify your saved VALU snapshot.', status: 502 }
  if (!taster) return { error: 'No completed VALU snapshot is linked to this account.', status: 404 }

  const { data: candidate, error: candidateError } = await admin.from('taster_identity_candidates')
    .select('candidate_email,candidate_role,linked_user_id')
    .eq('taster_id', taster.id)
    .maybeSingle()
  if (candidateError) return { error: 'Could not verify snapshot identity evidence.', status: 502 }
  const norm = value => String(value || '').trim().toLowerCase().replace(/\s+/g, ' ')
  if (candidate?.linked_user_id && candidate.linked_user_id !== user.id) {
    return { error: 'This snapshot has conflicting account ownership evidence. Valoria support must review it.', status: 409 }
  }
  if (candidate?.candidate_email && norm(candidate.candidate_email) !== norm(user.email)) {
    return { error: 'The saved snapshot email does not match this account. Valoria support must review it.', status: 403 }
  }
  if (candidate?.candidate_role && norm(candidate.candidate_role) !== norm(taster.role)) {
    return { error: 'The saved snapshot role conflicts with account evidence. Valoria support must review it.', status: 403 }
  }

  const { data: completedByAccount, error: accountAssessmentError } = await admin.from('valu_assessments')
    .select('id')
    .eq('user_id', user.id)
    .not('completed_at', 'is', null)
    .limit(1)
    .maybeSingle()
  if (accountAssessmentError) return { error: 'Could not verify your VALU assessment status.', status: 502 }
  const { data: completedBySnapshot, error: snapshotAssessmentError } = await admin.from('valu_assessments')
    .select('id')
    .eq('taster_id', taster.id)
    .not('completed_at', 'is', null)
    .limit(1)
    .maybeSingle()
  if (snapshotAssessmentError) return { error: 'Could not verify your VALU assessment status.', status: 502 }
  return { taster, completed: Boolean(completedByAccount || completedBySnapshot) }
}

export async function GET(request) {
  let admin
  try { admin = getAdmin() } catch { return NextResponse.json({ error: 'Server misconfigured.' }, { status: 503 }) }
  const auth = await getAccount(request, admin)
  if (auth.error) return auth.error
  const snapshot = await getOwnedSnapshot(admin, auth.user)
  if (snapshot.error) {
    if (snapshot.status === 404) return NextResponse.json({ can_continue: false, assessment_completed: false }, { headers: { 'Cache-Control': 'no-store' } })
    return NextResponse.json({ error: snapshot.error }, { status: snapshot.status })
  }
  return NextResponse.json({
    can_continue: !snapshot.completed,
    assessment_completed: snapshot.completed,
  }, { headers: { 'Cache-Control': 'no-store' } })
}

export async function POST(request) {
  let admin
  try { admin = getAdmin() } catch { return NextResponse.json({ error: 'Server misconfigured.' }, { status: 503 }) }
  const auth = await getAccount(request, admin)
  if (auth.error) return auth.error
  const snapshot = await getOwnedSnapshot(admin, auth.user)
  if (snapshot.error) return NextResponse.json({ error: snapshot.error }, { status: snapshot.status })
  if (snapshot.completed) return NextResponse.json({ error: 'Your full VALU assessment is already complete.', already_completed: true }, { status: 409 })

  const handoffCode = randomBytes(32).toString('base64url')
  const tokenHash = createHash('sha256').update(handoffCode).digest('hex')
  const expiresAt = new Date(Date.now() + HANDOFF_TTL_SECONDS * 1000).toISOString()
  const { error: insertError } = await admin.from('valoria_reentry_links').insert({
    user_id: auth.user.id,
    token: tokenHash,
    entry_point: 'dashboard_assessment',
    target_stage: 'assess',
    source: 'authenticated_dashboard',
    source_id: snapshot.taster.id,
    expires_at: expiresAt,
  })
  if (insertError) {
    console.error('VALU dashboard handoff issuance failed:', insertError.message)
    return NextResponse.json({ error: 'Secure assessment access is temporarily unavailable. Please try again.' }, { status: 503 })
  }

  const destination = new URL(ASSESSMENT_ORIGIN)
  destination.search = new URLSearchParams({ full: '1' }).toString()
  destination.hash = new URLSearchParams({ handoff_code: handoffCode }).toString()
  return NextResponse.json({ url: destination.toString(), expires_in: HANDOFF_TTL_SECONDS }, {
    headers: { 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer' },
  })
}
