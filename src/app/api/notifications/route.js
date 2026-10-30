// src/app/api/notifications/route.js
//
// GET  /api/notifications         → this user's notifications, newest first
// PATCH /api/notifications        → { id } marks one read, or { all: true } marks all read
//
// Confirmed 24 July 2026: the real table is `platform_notifications`
// (renamed from a colliding pre-existing `notifications` table with a
// different schema). This file was still querying the old `notifications`
// table with the new schema's column names (action_url, read_at) — every
// call has been failing with a column-not-found error since this route was
// introduced, meaning the notification bell has never actually worked.
//
// Originally written against @supabase/ssr's createServerClient, which
// isn't a dependency of this project (only @supabase/supabase-js is) — that
// caused every build since this file was introduced to fail with
// "Module not found: Can't resolve '@supabase/ssr'". Rewritten to read the
// session cookie directly, the same way middleware.js already does, and
// pass the user's access token through to supabase-js so RLS is enforced
// as that user rather than via the service-role key.

import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SB_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

async function getAuthedClient(request) {
  if (!SB_URL || !SB_ANON_KEY) return { supabase: null, user: null }

  // Let Supabase SSR decode its own base64-prefixed and chunked auth cookies.
  // This avoids hand-parsing a browser storage format and keeps user identity
  // verified by Auth rather than trusting decoded cookie contents.
  const supabase = createServerClient(SB_URL, SB_ANON_KEY, {
    cookies: {
      getAll() { return request.cookies.getAll() },
      setAll() {},
    },
  })
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return { supabase: null, user: null }
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
    .from('platform_notifications')
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

  let query = supabase.from('platform_notifications').update({ read_at: now }).eq('user_id', user.id)

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
