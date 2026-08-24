import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SB_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const SB_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

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

  // Always let Supabase validate/refresh the browser session. Do not decode
  // the auth JWT manually: cookie formats can change and a decoded payload
  // is not, by itself, proof that the session is still valid.
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

  // ── Admin authorization ───────────────────────────────────────────────
  // /admin/login must remain public. Every other /admin route requires a
  // valid Supabase user AND a matching row in the server-only admin_users
  // table. The service-role client is used only for this authorization
  // lookup; the service key never reaches the browser.
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const loginUrl = new URL('/admin/login', request.url)

    if (!user) return NextResponse.redirect(loginUrl)
    if (!SB_SERVICE_KEY) return NextResponse.redirect(loginUrl)

    try {
      const adminClient = createClient(SB_URL, SB_SERVICE_KEY, {
        auth: { autoRefreshToken: false, persistSession: false },
      })

      const { data: admin, error } = await adminClient
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
      return NextResponse.redirect(loginUrl)
    }

    return response
  }

  // ── Profile completeness gate ─────────────────────────────────────────
  // Buyers have `profiles` rows and should be able to use /dashboard even
  // though they intentionally do not have professional_profiles rows.
  // Professionals are checked against professional_profiles only when they
  // are accessing their profile area.
  if (
    user &&
    SB_SERVICE_KEY &&
    (
      pathname.startsWith('/dashboard') ||
      pathname.startsWith('/profile/')
    ) &&
    !pathname.startsWith('/profile/setup')
  ) {
    try {
      const adminClient = createClient(SB_URL, SB_SERVICE_KEY, {
        auth: { autoRefreshToken: false, persistSession: false },
      })

      const { data: buyerProfile } = await adminClient
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle()

      // Buyers are intentionally not subject to the professional profile
      // completeness gate.
      if (buyerProfile) return response

      // Only professionals need professional profile completion.
      const { data: profile } = await adminClient
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
      // Do not turn a transient middleware/database error into a site-wide
      // lockout. Admin authorization above intentionally fails closed.
    }
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
