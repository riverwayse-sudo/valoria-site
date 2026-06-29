import { NextResponse } from 'next/server'

// ── SITE LOCKDOWN ─────────────────────────────────────────────────────────
// Set NEXT_PUBLIC_SITE_LOCKED=true in Vercel environment variables to lock.
// Set to false or remove to unlock. No code deployment needed to toggle.
//
// Routes that always remain accessible even when locked:
const ALLOWED_ROUTES = [
  '/waitlist',
  '/privacypolicy',
  '/terms-of-use',
  '/api',           // API routes must stay open
  '/_next',         // Next.js internals
  '/favicon',
  '/logo',
  '/og-image',
  '/robots',
  '/sitemap',
]

export function middleware(request) {
  const { pathname } = request.nextUrl
  const isLocked = process.env.NEXT_PUBLIC_SITE_LOCKED === 'true'

  if (!isLocked) return NextResponse.next()

  // Allow assessment platform subdomain traffic through
  const hostname = request.headers.get('host') || ''
  if (hostname.startsWith('assessment.')) return NextResponse.next()

  // Allow any route in the allowed list
  const isAllowed = ALLOWED_ROUTES.some(route => pathname.startsWith(route))
  if (isAllowed) return NextResponse.next()

  // Allow static files
  if (pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|webp|css|js|woff|woff2)$/)) {
    return NextResponse.next()
  }

  // Everything else → redirect to waitlist
  return NextResponse.redirect(new URL('/waitlist', request.url))
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
