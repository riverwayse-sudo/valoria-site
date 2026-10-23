import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SB_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export async function middleware(request) {
  const { pathname } = request.nextUrl

  // The VALU assessment SPA is an external application rewritten in via
  // next.config.js. Its HTML shell requests hashed /valu/assessment/assets/*.js
  // and *.css files, and the matcher below deliberately excludes only
  // _next/static and _next/image — so those requests were reaching this
  // middleware. Two problems followed:
  //   1. the static-extension allowlist covered images and fonts but not
  //      js/css/mjs/map/json, so the assets were not recognised as static;
  //   2. the middleware then made an unguarded supabase.auth.getUser() call on
  //      every one of those requests, so any auth/network failure threw and the
  //      asset came back as a 500 — the page rendered but appeared broken.
  // This site's middleware has no business gating a proxied third-party app:
  // bypass the whole prefix outright.
  if (pathname === '/valu/assessment' || pathname.startsWith('/valu/assessment/')) return NextResponse.next()

  const STATIC_ASSET = /\.(?:png|jpe?g|gif|svg|ico|webp|avif|bmp|js|mjs|cjs|jsx|css|map|json|txt|xml|webmanifest|woff2?|ttf|otf|eot|wasm)$/
  if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname === '/favicon.ico' || STATIC_ASSET.test(pathname)) return NextResponse.next()
  if (!SB_URL || !SB_ANON_KEY) return NextResponse.next()

  let response = NextResponse.next({ request: { headers: request.headers } })
  const supabase = createServerClient(SB_URL, SB_ANON_KEY, {
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

  // A transient Supabase/network failure must not turn every page on the site
  // into a 500. If the identity cannot be resolved, treat the request as
  // unauthenticated and keep going: public pages still render, while the admin
  // guard below still fails closed by redirecting to login. Previously this
  // call was unguarded, so an auth outage produced site-wide 500s.
  let user = null
  try {
    const { data } = await supabase.auth.getUser()
    user = data?.user || null
  } catch {
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
