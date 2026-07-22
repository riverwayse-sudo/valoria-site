// src/app/api/notifications/route.js
//
// GET  /api/notifications         → this user's notifications, newest first
// PATCH /api/notifications        → { id } marks one read, or { all: true } marks all read
//
// NOTE: table name assumed to be `notifications` below — double-check this
// against the live Supabase schema before trusting it. There's an earlier,
// unconfirmed note that the real table may have been renamed to
// `platform_notifications` to avoid colliding with a different pre-existing
// `notifications` table. If so, change the two `.from('notifications')`
// calls below to match.
//
// Originally written against @supabase/ssr's createServerClient, which
// isn't a dependency of this project (only @supabase/supabase-js is) — that
// caused every build since this file was introduced to fail with
// "Module not found: Can't resolve '@supabase/ssr'". Rewritten to read the
// session cookie directly, the same way middleware.js already does, and
// pass the user's access token through to supabase-js so RLS is enforced
// as that user rather than via the service-role key.

import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SB_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

function getAccessToken(request) {
  const cookie = request.cookies.getAll().find(c => /^sb-.*-auth-token/.test(c.name))
  if (!cookie) return null
  try {
    // Supabase's browser client stores the session as a JSON blob (or an
    // array of chunked JSON strings for large sessions) in this cookie.
    const raw = decodeURIComponent(cookie.value)
    const parsed = JSON.parse(raw)
    return parsed?.access_token || parsed?.[0]?.access_token || null
  } catch {
    return null
  }
}

async function getAuthedClient(request) {
  const token = getAccessToken(request)
  if (!token) return { supabase: null, user: null }

  const supabase = createClient(SB_URL, SB_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  })
  const { data: { user } } = await supabase.auth.getUser(token)
  return { supabase, user }
}

export async function GET(request) {
  const { supabase, user } = await getAuthedClient(request)
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
  const { supabase, user } = await getAuthedClient(request)
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
