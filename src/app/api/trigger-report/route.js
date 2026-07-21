// src/app/api/notifications/route.js
//
// GET  /api/notifications         → this user's notifications, newest first
// PATCH /api/notifications        → { id } marks one read, or { all: true } marks all read
//
// Uses the caller's own session (via the sb-*-auth-token cookie, same
// pattern middleware.js already reads) so RLS enforces "only your own
// notifications" — this route does not use the service-role key, unlike
// submit-assessment.js / claim-listing.js, because it only ever reads or
// updates rows the signed-in user is already allowed to touch under the
// policies in 002_events_and_notifications.sql.

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

function getSupabase() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get: (name) => cookieStore.get(name)?.value,
      },
    }
  )
}

export async function GET(request) {
  const supabase = getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Not signed in.' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const limit = Math.min(Number(searchParams.get('limit')) || 20, 50)

  const { data, error } = await supabase
    .from('notifications')
    .select('id, type, title, body, action_url, read_at, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('GET /api/notifications:', error)
    return NextResponse.json({ error: 'Could not load notifications.' }, { status: 500 })
  }

  const unreadCount = data.filter((n) => !n.read_at).length
  return NextResponse.json({ notifications: data, unreadCount })
}

export async function PATCH(request) {
  const supabase = getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Not signed in.' }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const now = new Date().toISOString()

  let query = supabase.from('notifications').update({ read_at: now }).eq('user_id', user.id)

  if (body.all) {
    query = query.is('read_at', null)
  } else if (body.id) {
    query = query.eq('id', body.id)
  } else {
    return NextResponse.json({ error: 'Provide { id } or { all: true }.' }, { status: 400 })
  }

  const { error } = await query
  if (error) {
    console.error('PATCH /api/notifications:', error)
    return NextResponse.json({ error: 'Could not update notifications.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
