import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SB_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY
const admin = createClient(SB_URL, SERVICE)

function norm(value) {
  return String(value || '').trim().toLowerCase().replace(/\s+/g, ' ')
}

export async function POST(request) {
  if (!SERVICE || !SB_URL || !SB_ANON) {
    return NextResponse.json({ error: 'Server misconfigured.' }, { status: 500 })
  }

  let body
  try { body = await request.json() } catch { return NextResponse.json({ error: 'Invalid request.' }, { status: 400 }) }
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
    .select('id,name,role,user_id')
    .eq('id', tasterId)
    .maybeSingle()

  if (tasterError || !taster) return NextResponse.json({ error: 'Teaser result not found.' }, { status: 404 })
  if (taster.user_id && taster.user_id !== user.id) return NextResponse.json({ error: 'This teaser result is already linked.' }, { status: 409 })

  const metadataName = user.user_metadata?.display_name || user.user_metadata?.full_name || name
  if (norm(metadataName) !== norm(taster.name)) {
    return NextResponse.json({ error: 'The account name must match the teaser name.' }, { status: 403 })
  }
  if (role && norm(role) !== norm(taster.role)) {
    return NextResponse.json({ error: 'The account role must match the teaser role.' }, { status: 403 })
  }

  const { error: linkError } = await admin
    .from('taster_sessions')
    .update({ user_id: user.id, linked_at: new Date().toISOString() })
    .eq('id', tasterId)
    .is('user_id', null)

  if (linkError) return NextResponse.json({ error: 'Could not link the teaser result.' }, { status: 502 })
  return NextResponse.json({ ok: true, next: '/profile/setup' })
}
