import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SB_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export async function middleware(request) {
  const { pathname } = request.nextUrl

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname === '/favicon.ico' ||
    pathname.match(/\.(png|jpg|jpeg|svg|ico|webp|woff|woff2|ttf)$/)
  ) {
    return NextResponse.next()
  }

  if (!SB_URL || !SB_ANON_KEY) return NextResponse.next()

  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(SB_URL, SB_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value)
          response.cookies.set(name, value, options)
        })
      },
    },
  })

  const { data: { user } } = await supabase.auth.getUser()

  // Admin authorization intentionally uses the authenticated user's own
  // admin_users row instead of requiring SUPABASE_SERVICE_ROLE_KEY in
  // middleware. This keeps the gate secure under RLS and prevents a missing
  // Vercel service-role variable from making every valid admin appear logged
  // out immediately after sign-in.
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const loginUrl = new URL('/admin/login', request.url)

    if (!user) return NextResponse.redirect(loginUrl)

    try {
      const { data: admin, error } = await supabase
        .from('admin_users')
        .select('id')
        .eq('id', user.id)
        .maybeSingle()

      if (error || !admin) {
        const unauthorizedUrl = new URL('/admin/login', request.url)
        unauthorizedUrl.searchParams.set('error', 'unauthorized')
        return NextResponse.redirect(unauthorizedUrl)
      }
    } catch {
      const errorUrl = new URL('/admin/login', request.url)
      errorUrl.searchParams.set('error', 'authorization')
      return NextResponse.redirect(errorUrl)
    }

    return response
  }

  // Profile completeness gate. Buyers have `profiles` rows and should be
  // able to use /dashboard even though they intentionally do not have
  // professional_profiles rows. Professionals are checked only when they
  // access the protected profile area.
  if (
    user &&
    (
      pathname.startsWith('/dashboard') ||
      pathname.startsWith('/profile/')
    ) &&
    !pathname.startsWith('/profile/setup')
  ) {
    try {
      const { data: buyerProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle()

      if (buyerProfile) return response

      const { data: profile } = await supabase
        .from('professional_profiles')
        .select('profile_complete, display_name, headline, bio, active_tracks, industry, username, phone, current_job_title')
        .eq('id', user.id)
        .maybeSingle()

      if (!profile || !profile.profile_complete) {
        const missing = !profile
          ? ['display_name', 'headline', 'bio', 'active_tracks', 'industry', 'username', 'phone', 'current_job_title']
          : ['display_name', 'headline', 'bio', 'industry', 'username', 'phone', 'current_job_title']
              .filter(field => !profile[field])
              .concat(!profile.active_tracks?.length ? ['active_tracks'] : [])

        const redirectUrl = new URL('/profile/setup', request.url)
        if (missing.length) redirectUrl.searchParams.set('incomplete', missing.join(','))
        return NextResponse.redirect(redirectUrl)
      }
    } catch {
      // Do not turn a transient profile lookup failure into a site-wide lockout.
    }
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
