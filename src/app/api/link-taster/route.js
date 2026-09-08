import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

function norm(value) {
  return String(value || '').trim().toLowerCase().replace(/\s+/g, ' ')
}

export async function POST(request) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'Server misconfigured.' }, { status: 500 })
  }

  let body
  try { body = await request.json() } catch { return NextResponse.json({ error: 'Invalid request.' }, { status: 400 }) }
  const { taster_id: tasterId, user_id: userId, name, role } = body || {}
  if (!tasterId || !userId) return NextResponse.json({ error: 'taster_id and user_id are required.' }, { status: 400 })

  const { data: authData, error: authError } = await supabase.auth.admin.getUserById(userId)
  if (authError || !authData?.user) return NextResponse.json({ error: 'Account could not be verified.' }, { status: 403 })

  const { data: taster, error: tasterError } = await supabase
    .from('taster_sessions')
    .select('id,name,role,user_id')
    .eq('id', tasterId)
    .maybeSingle()
  if (tasterError || !taster) return NextResponse.json({ error: 'Teaser result not found.' }, { status: 404 })
  if (taster.user_id && taster.user_id !== userId) return NextResponse.json({ error: 'This teaser result is already linked.' }, { status: 409 })

  const metadataName = authData.user.user_metadata?.display_name || authData.user.user_metadata?.full_name || name
  if (norm(metadataName) !== norm(taster.name)) {
    return NextResponse.json({ error: 'The account name must match the teaser name.' }, { status: 403 })
  }
  if (role && norm(role) !== norm(taster.role)) {
    return NextResponse.json({ error: 'The account role must match the teaser role.' }, { status: 403 })
  }

  const { error: linkError } = await supabase
    .from('taster_sessions')
    .update({ user_id: userId, linked_at: new Date().toISOString() })
    .eq('id', tasterId)
    .is('user_id', null)
  if (linkError) return NextResponse.json({ error: 'Could not link the teaser result.' }, { status: 502 })

  return NextResponse.json({ ok: true, next: '/profile/setup' })
}
