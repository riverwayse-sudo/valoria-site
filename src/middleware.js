import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SB_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

// Pre-launch waitlist lockdown (isLaunched()/PUBLIC allow-list/preview-bypass
// cookie) has been removed — launch happened 18 July 2026 and isLaunched()
// has returned true ever since, so that branch was permanently a no-op.
// This file's only remaining job is the post-launch profile-completeness
// gate below. If a pre-launch-style lockdown is ever needed again (e.g. for
// a future re-launch or maintenance window), reintroduce it as its own
// explicit check rather than reviving this dead code.

export async function middleware(request) {
  const { pathname } = request.nextUrl

  // Static assets and API routes — never gate.
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname === '/favicon.ico' ||
    pathname.match(/\.(png|jpg|jpeg|svg|ico|webp|woff|woff2|ttf)$/)
  ) {
    return NextResponse.next()
  }

  // ── Profile completeness gate ──────────────────────────────────────────
  // If a signed-in user is trying to access the dashboard (buyer side) or
  // /profile/* (their own profile), check that their professional profile
  // is complete. If it isn't, redirect to /profile/setup.
  // Skip this check for /profile/setup itself, the login/signup pages, and
  // requests with no Supabase session at all — those pages/routes handle
  // their own auth requirements and should always be reachable here.
  const hasSupabaseSession = request.cookies.getAll().some(c => /^sb-.*-auth-token/.test(c.name))

  if (
    hasSupabaseSession &&
    SB_URL && SB_SERVICE_KEY &&
    (pathname.startsWith('/dashboard') || pathname.startsWith('/profile/')) &&
    !pathname.startsWith('/profile/setup') &&
    !pathname.startsWith('/login') &&
    !pathname.startsWith('/signup')
  ) {
    try {
      const supabase = createClient(SB_URL, SB_SERVICE_KEY)
      // Get the user's auth UID from the session cookie
      const token = request.cookies.getAll()
        .find(c => /^sb-.*-auth-token/.test(c.name))?.value
      if (token) {
        // Decode the JWT to get the user ID without a network call
        const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
        const userId = payload?.sub
        if (userId) {
          const { data: profile } = await supabase
            .from('professional_profiles')
            .select('profile_complete')
            .eq('id', userId)
            .maybeSingle()
          // If no profile row, or profile_complete is false, redirect to setup
          if (!profile || !profile.profile_complete) {
            return NextResponse.redirect(new URL('/profile/setup', request.url))
          }
        }
      }
    } catch {
      // If anything fails, allow through — don't block on a middleware error
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
