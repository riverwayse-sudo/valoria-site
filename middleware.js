import { NextResponse } from 'next/server'

// Always accessible — no cookie required
// LAUNCH MODE: only the waitlist page (+ the legal pages it links to) is public.
// Everything else — including the homepage — redirects to /waitlist.
const PUBLIC = new Set([
  '/waitlist',
  '/privacypolicy',
  '/terms-of-use',
])

export function middleware(request) {
  const { pathname } = request.nextUrl

  // Static assets — never gate
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname === '/favicon.ico' ||
    pathname.match(/\.(png|jpg|jpeg|svg|ico|webp|woff|woff2|ttf)$/)
  ) {
    return NextResponse.next()
  }

  // Always-public pages
  if (PUBLIC.has(pathname)) {
    return NextResponse.next()
  }

  // ── Dev preview bypass ────────────────────────────────────────────────────
  // Visit any URL with ?preview=vi2025 to bypass the gate for 7 days.
  // Uses a SEPARATE cookie (vi_dev_preview) so it doesn't affect
  // the WaitlistGate component which checks vi_waitlist_v2.
  const preview = request.nextUrl.searchParams.get('preview')
  if (preview === 'vi2025') {
    const res = NextResponse.next()
    res.cookies.set('vi_dev_preview', '1', {
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
      sameSite: 'lax',
    })
    return res
  }

  // ── Gate check ────────────────────────────────────────────────────────────
  // LAUNCH MODE: joining the waitlist no longer unlocks the rest of the site —
  // there's nothing ready behind it yet. Only the dev preview bypass gets through.
  const previewCookie = request.cookies.get('vi_dev_preview')

  if (previewCookie) {
    return NextResponse.next()
  }

  // No cookie — send to the waitlist page (only public page during launch mode)
  return NextResponse.redirect(new URL('/waitlist', request.url))
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
