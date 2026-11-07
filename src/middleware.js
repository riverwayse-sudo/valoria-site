import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { normalizeSupabaseProjectUrl } from '@/lib/supabase-url'

const configuredSBUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const SB_URL = configuredSBUrl ? normalizeSupabaseProjectUrl(configuredSBUrl) : null
//
const SB_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export async function middleware(request) {
  const { pathname } = request.nextUrl
  const isPreview = process.env.NEXT_PUBLIC_VALU_PREVIEW === '1' || process.env.VALU_PREVIEW === '1' || process.env.VERCEL_ENV === 'preview' || process.env.CF_WORKERS_PREVIEW === '1'
  const stagingApiEnabled = process.env.VALU_STAGING_API_ENABLED === '1'
  const isReadOnlyPreview = isPreview && !stagingApiEnabled
  // Keep the public staging site read-only, but permit only the two authenticated
  // endpoints required to link a confirmed taster and issue a one-time assessment handoff.
  const isPreviewApiAllowed =
    (pathname === '/api/link-taster' && request.method === 'POST') ||
    (pathname === '/api/link-assessment' && request.method === 'POST') ||
    (pathname === '/api/valu-handoff' && ['GET', 'POST'].includes(request.method))
  if (isReadOnlyPreview && pathname.startsWith('/api/') && !isPreviewApiAllowed) {
    return NextResponse.json(
      { error: 'Staging preview is simulation-only; API access is disabled.' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } }
    )
  }
  // All other read-only preview routes bypass Supabase. The allow-listed API
  // routes continue below and independently verify the confirmed user token.
  if (isReadOnlyPreview && !isPreviewApiAllowed) return NextResponse.next()

  if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname === '/favicon.ico' || pathname.match(/\.(png|jpg|jpeg|svg|ico|webp|woff|woff2|ttf)$/)) return NextResponse.next()
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

  const { data: { user } } = await supabase.auth.getUser()

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

export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'] }
