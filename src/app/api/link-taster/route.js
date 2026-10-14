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
      next: '/profile/setup',
    },
  })
}
