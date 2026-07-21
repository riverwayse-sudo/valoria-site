import { NextResponse } from 'next/server'
import { isLaunched } from '@/lib/launchDate'
import { createClient } from '@supabase/supabase-js'

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SB_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

// FULL LOCKDOWN, by design, until launch: only these stay reachable.
// Everything else — including the homepage — redirects to /waitlist.
// After LAUNCH_DATE, this whole gate lifts automatically, for every
// route, with no redeploy and no manual toggle. See src/lib/launchDate.js
// for the one shared switch both this file and Nav.jsx read from.
const PUBLIC = new Set([
  '/waitlist',
  '/privacypolicy',
  '/terms-of-use',
])

// Server-only secret for Joshua's own pre-launch testing. Never prefixed
// NEXT_PUBLIC_, so it never ships in the client bundle or public source.
const PREVIEW_SECRET = process.env.PREVIEW_BYPASS_SECRET

export function middleware(request) {
  const { pathname } = request.nextUrl

  // Static assets and API routes — never gate. The waitlist page itself
  // depends on /api/waitlist working pre-launch, so this must never block.
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname === '/favicon.ico' ||
    pathname.match(/\.(png|jpg|jpeg|svg|ico|webp|woff|woff2|ttf)$/)
  ) {
    return NextResponse.next()
  }

  // ── Preview bypass (Joshua's own testing only) ────────────────────────────
  const previewCookie = request.cookies.get('vi_dev_preview')
  if (PREVIEW_SECRET && request.nextUrl.searchParams.get('preview') === PREVIEW_SECRET) {
    const res = NextResponse.next()
    res.cookies.set('vi_dev_preview', '1', { path: '/', maxAge: 60 * 60 * 24 * 7, sameSite: 'lax' })
    return res
  }
  if (previewCookie) {
    return NextResponse.next()
  }

  // ── Authenticated-user bypass ──────────────────────────────────────────
  // signup/page.jsx and login/page.jsx both assume real accounts can reach
  // /dashboard, /profile/setup etc. pre-launch — but this gate never
  // actually granted that until now. Deliberately NOT checking
  // vi_waitlist_v2: that same cookie is also set by the plain waitlist
  // form (WaitlistForm.jsx) on simple lead capture, so trusting it here
  // would unlock the entire site for every waitlist signup, not just real
  // accounts. Supabase's own session cookie only exists for someone who
  // actually authenticated, so that's the correct signal — checked as a
  // prefix match since supabase-js can chunk large tokens into
  // sb-<ref>-auth-token.0, .1, etc.
  const hasSupabaseSession = request.cookies.getAll().some(c => /^sb-.*-auth-token/.test(c.name))
  if (hasSupabaseSession) {
    // ── Profile completeness gate ──────────────────────────────────────────
    // If they're authenticated and trying to access the dashboard (buyer side)
    // or /profile/* (their own profile), check that their professional profile
    // is complete. If it isn't, redirect to /profile/setup.
    // Skip this check for /profile/setup itself, the login/signup pages, and
    // public pages — they should always be reachable.
    if (
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

  // ── Post-launch: full lockdown lifts automatically ────────────────────────
  if (isLaunched()) {
    return NextResponse.next()
  }

  // ── Pre-launch: only the always-public pages are reachable ───────────────
  if (PUBLIC.has(pathname)) {
    return NextResponse.next()
  }
  return NextResponse.redirect(new URL('/waitlist', request.url))
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
