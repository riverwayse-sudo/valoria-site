export function middleware(request) {
  const { pathname } = request.nextUrl
  const cookie = request.cookies.get('vi_waitlist_v2')

  if (
    pathname === '/' ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname === '/favicon.ico'
  ) {
    return
  }

  if (!cookie) {
    return Response.redirect(new URL('/', request.url))
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
