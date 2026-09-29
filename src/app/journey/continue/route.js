import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SB_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY

const STAGE_ROUTES = {
  connect: '/dashboard',
  assess: 'https://assessment.valoriainstitute.com/',
  profile: '/profile/setup',
  capability: '/profile/setup',
  eligibility: '/dashboard',
  marketplace: '/marketplace',
  opportunity: '/opportunities',
}

export async function GET(request) {
  const token = request.nextUrl.searchParams.get('token')?.trim()
  if (!token || !SERVICE || !SB_URL || !SB_ANON) {
    return NextResponse.redirect(new URL('/journey', request.url))
  }

  const admin = createClient(SB_URL, SERVICE, { auth: { persistSession:false, autoRefreshToken:false } })
  const { data: link, error } = await admin
    .from('valoria_reentry_links')
    .select('id,user_id,target_stage,expires_at,used_at')
    .eq('token', token)
    .maybeSingle()

  if (error || !link || link.used_at || (link.expires_at && new Date(link.expires_at) <= new Date())) {
    return NextResponse.redirect(new URL('/journey', request.url))
  }

  const response = NextResponse.next()
  const supabase = createServerClient(SB_URL, SB_ANON, {
    cookies: {
      getAll() { return request.cookies.getAll() },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
      },
    },
  })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    const signup = new URL('/signup', request.url)
    signup.searchParams.set('returnTo', '/journey/continue?token=' + encodeURIComponent(token))
    return NextResponse.redirect(signup)
  }

  if (link.user_id && link.user_id !== user.id) {
    return NextResponse.redirect(new URL('/journey', request.url))
  }

  await admin.from('valoria_reentry_links').update({
    user_id: user.id,
    used_at: new Date().toISOString(),
  }).eq('id', link.id).is('used_at', null)

  await admin.from('valoria_journey_events').insert({
    user_id: user.id,
    event_key: 'journey_reentered',
    source: 'reentry_link',
    source_id: link.id,
    metadata: { target_stage: link.target_stage },
  })

  const target = STAGE_ROUTES[link.target_stage] || '/journey'
  return NextResponse.redirect(new URL(target, request.url))
}
