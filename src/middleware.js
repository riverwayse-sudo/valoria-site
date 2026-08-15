import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SB_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

// Post-launch middleware responsibilities:
// 1. enforce server-side admin authorization before /admin is rendered
// 2. enforce profile completeness for authenticated dashboard/profile journeys
// API routes remain responsible for their own authorization.

export async function middleware(request) {
  const { pathname } = request.nextUrl

  // Static assets and API routes — never gate here. API routes perform their
  // own authentication/authorization checks at the server boundary.
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname === '/favicon.ico' ||
    pathname.match(/\.(png|jpg|jpeg|svg|ico|webp|woff|woff2|ttf)$/)
  ) {
    return NextResponse.next()
  }

  const authCookie = request.cookies.getAll().find(c => /^sb-.*-auth-token/.test(c.name))
  const hasSupabaseSession = Boolean(authCookie)

  // Use Supabase's server-side token verification rather than decoding the
  // JWT payload ourselves. A decoded JWT is not proof that its signature is
  // valid and therefore must never be used as the authorization decision.
  let userId = null
  let verifiedUser = null
  if (hasSupabaseSession && SB_URL && SB_SERVICE_KEY) {
    try {
      const supabase = createClient(SB_URL, SB_SERVICE_KEY)
      const token = authCookie.value
      const { data, error } = await supabase.auth.getUser(token)
      if (!error && data?.user?.id) {
        verifiedUser = data.user
        userId = data.user.id
      }
    } catch {
      userId = null
    }
  }

  // ── Admin authorization ────────────────────────────────────────────────
  // /admin must fail closed. The dedicated admin_users table is the source
  // of truth; client-side email allowlists are not authorization controls.
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const loginUrl = new URL('/admin/login', request.url)
    if (!userId || !SB_URL || !SB_SERVICE_KEY) return NextResponse.redirect(loginUrl)

    try {
      const supabase = createClient(SB_URL, SB_SERVICE_KEY)
      const { data: admin } = await supabase
        .from('admin_users')
        .select('id')
        .eq('id', userId)
        .maybeSingle()
      if (!admin) return NextResponse.redirect(loginUrl)
    } catch {
      return NextResponse.redirect(loginUrl)
    }
    return NextResponse.next()
  }

  // ── Profile completeness gate ──────────────────────────────────────────
  // Only apply this to a verified authenticated user. If verification fails,
  // leave the request to the page-level auth handling rather than treating an
  // unverified JWT payload as an authenticated identity.
  if (
    verifiedUser &&
    SB_URL && SB_SERVICE_KEY &&
    (pathname.startsWith('/dashboard') || pathname.startsWith('/profile/')) &&
    !pathname.startsWith('/profile/setup') &&
    !pathname.startsWith('/login') &&
    !pathname.startsWith('/signup')
  ) {
    try {
      const supabase = createClient(SB_URL, SB_SERVICE_KEY)
      const { data: profile } = await supabase
        .from('professional_profiles')
        .select('profile_complete, display_name, headline, bio, active_tracks, industry, username, phone, current_job_title')
        .eq('id', userId)
        .maybeSingle()

      if (!profile || !profile.profile_complete) {
        const missing = !profile
          ? ['display_name', 'headline', 'bio', 'active_tracks', 'industry', 'username', 'phone', 'current_job_title']
          : ['display_name', 'headline', 'bio', 'industry', 'username', 'phone', 'current_job_title']
              .filter(f => !profile[f])
              .concat(!profile.active_tracks?.length ? ['active_tracks'] : [])
        const redirectUrl = new URL('/profile/setup', request.url)
        if (missing.length) redirectUrl.searchParams.set('incomplete', missing.join(','))
        return NextResponse.redirect(redirectUrl)
      }
    } catch {
      // Middleware failure is not an authorization grant. The page-level
      // auth checks remain responsible for denying unauthorized data access.
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
