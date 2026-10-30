import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SB_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

async function getUser(request) {
  if (!SB_URL || !SB_ANON) return null
  const supabase = createServerClient(SB_URL, SB_ANON, {
    cookies: { getAll: () => request.cookies.getAll(), setAll: () => {} },
  })
  const { data: { user } } = await supabase.auth.getUser()
  return user || null
}

const STAGE_ROUTES = {
  connect: '/dashboard',
  report: '/report',
  profile: '/profile/setup',
  capability: '/profile/setup',
  eligibility: '/profile/setup',
  listed: '/marketplace',
  marketplace: '/marketplace',
  opportunity: '/opportunities',
}

export async function GET(request) {
  const { searchParams } = request.nextUrl
  const stage = searchParams.get('stage')?.trim() || ''
  const hasLegacyAssessmentParams = ['taster_id', 'name', 'role', 'experience', 'resume', 'token', 'pending_taster_id']
    .some(key => searchParams.has(key))

  // Assessment continuation is deliberately not a public route. Old email,
  // bookmark and notification links always return to the account dashboard.
  // The dashboard's authenticated POST to /api/valu-handoff is the only issuer.
  if (stage === 'assess' || searchParams.has('token') || hasLegacyAssessmentParams) {
    const user = await getUser(request)
    if (!user) {
      const login = new URL('/login', request.url)
      login.searchParams.set('returnTo', '/dashboard')
      return NextResponse.redirect(login)
    }
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  if (!stage) {
    const login = new URL('/login', request.url)
    login.searchParams.set('returnTo', '/dashboard')
    return NextResponse.redirect(login)
  }

  const user = await getUser(request)
  if (!user) {
    const signup = new URL('/signup', request.url)
    signup.searchParams.set('returnTo', '/dashboard')
    return NextResponse.redirect(signup)
  }
  if (!user.email_confirmed_at) {
    const login = new URL('/login', request.url)
    login.searchParams.set('returnTo', '/dashboard')
    return NextResponse.redirect(login)
  }

  return NextResponse.redirect(new URL(STAGE_ROUTES[stage] || '/journey', request.url))
}
