import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { shouldBypassAuth } from './lib/middleware-routing.js'

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SB_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export async function middleware(request) {
  const { pathname } = request.nextUrl

  // Bypass rules live in src/lib/middleware-routing.js so the incident that
  // caused the assessment-asset outage is unit-tested directly. See that file
  // for the full explanation: the proxied VALU assessment app's hashed
  // /valu/assessment/assets/*.js and *.css requests were reaching the Supabase
  // auth path and returning 500 whenever auth failed.
  if (shouldBypassAuth(pathname)) return NextResponse.next()

  if (!SB_URL || !SB_ANON_KEY) return NextResponse.next()

  let response = NextResponse.next({ request: { headers: request.headers } })

  // A transient Supabase/network failure — or a misconfigured Supabase URL —
  // must not turn every page on the site into a 500. Client construction and
  // the identity lookup are both fallible, so both live in the guard: if the
  // identity cannot be resolved, treat the request as unauthenticated and keep
  // going. Public pages still render, while the admin guard below still fails
  // closed by redirecting to login. Previously these calls were unguarded, so
  // an auth outage produced site-wide 500s.
  let supabase = null
  let user = null
  try {
    supabase = createServerClient(SB_URL, SB_ANON_KEY, {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })
        },
      },
    })
    const { data } = await supabase.auth.getUser()
    user = data?.user || null
  } catch {
    supabase = null
    user = null
  }

  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const loginUrl = new URL('/admin/login', request.url)
    if (!user) return NextResponse.redirect(loginUrl)
    try {
      const { data: admin, error } = await supabase.from('admin_users').select('id').eq('id', user.id).maybeSingle()
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

  // Progressive onboarding: an authenticated professional can enter the
  // dashboard with a starter profile. Full profile completion is no longer
  // the price of admission; marketplace eligibility remains governed
  // separately by capability/evidence/admin rules.
  const privateProfileRoute = pathname === '/profile/edit' || pathname.startsWith('/profile/edit/')
  if (user && privateProfileRoute && !pathname.startsWith('/profile/setup') && !pathname.startsWith('/profile/onboarding')) {
    try {
      const { data: buyerProfile } = await supabase.from('profiles').select('id').eq('id', user.id).maybeSingle()
      if (buyerProfile) return response

      const { data: profile } = await supabase
        .from('professional_profiles')
        .select('profile_complete, display_name, headline, bio, active_tracks, industry, username, phone, current_job_title')
        .eq('id', user.id)
        .maybeSingle()

      if (!profile || !profile.profile_complete) {
        const missing = !profile
          ? ['display_name', 'headline', 'bio', 'active_tracks', 'industry', 'username', 'phone', 'current_job_title']
          : ['display_name', 'headline', 'bio', 'industry', 'username', 'phone', 'current_job_title'].filter(field => !profile[field]).concat(!profile.active_tracks?.length ? ['active_tracks'] : [])
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

// Belt-and-braces with the in-function bypass: keep the proxied VALU
// assessment app out of the middleware matcher entirely so its hashed
// /valu/assessment/assets/*.js and *.css bundle requests never reach the
// Supabase auth path (which is what turned them into 500s).
export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico|valu/assessment).*)'] }
