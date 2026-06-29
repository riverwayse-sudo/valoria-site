import { NextResponse } from 'next/server'

export function middleware(request) {
  const submitted = request.cookies.get('vi_waitlist_v2')
  const { pathname } = request.nextUrl

  const allowed = [
    '/api/',
    '/_next/',
    '/favicon',
    '/robots',
    '/sitemap',
  ]
  if (allowed.some(p => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  if (!submitted && pathname !== '/') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
