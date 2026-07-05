import { NextResponse } from 'next/server'

// Always accessible — no cookie required
const PUBLIC = new Set([
  '/',
  '/waitlist',
  '/login',
  '/signup',
  '/register',
  '/reset-password',
  '/privacypolicy',
  '/terms-of-use',
  '/about-us',
  '/contact-us',
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
  // Visit any URL with ?preview=<WAITLIST_PREVIEW_CODE> to bypass the gate
  // for 7 days. The code lives in an env var (set it in Vercel), not in the
  // source — the old hardcoded 'vi2025' value is sitting in public GitHub
  // history and must be treated as burned even after this change ships.
  // Uses a SEPARATE cookie (vi_dev_preview) so it doesn't affect
  // the WaitlistGate component which checks vi_waitlist_v2.
  const preview = request.nextUrl.searchParams.get('preview')
  const previewCode = process.env.WAITLIST_PREVIEW_CODE
  if (previewCode && preview === previewCode) {
    const res = NextResponse.next()
    res.cookies.set('vi_dev_preview', '1', {
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
      sameSite: 'lax',
    })
    return res
  }

  // ── Gate check ────────────────────────────────────────────────────────────
  // Allow through if they have either:
  // (a) submitted the waitlist — vi_waitlist_v2 cookie (set by WaitlistGate or /waitlist page)
  // (b) dev preview bypass — vi_dev_preview cookie (set above)
  const waitlistCookie = request.cookies.get('vi_waitlist_v2')
  const previewCookie  = request.cookies.get('vi_dev_preview')

  if (waitlistCookie || previewCookie) {
    return NextResponse.next()
  }

  // No cookie — send to home page where the WaitlistGate popup appears
  return NextResponse.redirect(new URL('/', request.url))
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
