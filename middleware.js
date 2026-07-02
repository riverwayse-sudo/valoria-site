import { NextResponse } from 'next/server';

// Routes that are always accessible (don't get locked)
const PUBLIC_PATHS = [
  '/waitlist',
  '/api/waitlist',
  '/_next',
  '/favicon.ico',
  '/fonts',
  '/images',
  '/logo',
];

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Allow public paths through
  const isPublic = PUBLIC_PATHS.some((path) => pathname.startsWith(path));
  if (isPublic) {
    return NextResponse.next();
  }

  // Redirect everything else to /waitlist
  const waitlistUrl = request.nextUrl.clone();
  waitlistUrl.pathname = '/waitlist';
  return NextResponse.redirect(waitlistUrl);
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
