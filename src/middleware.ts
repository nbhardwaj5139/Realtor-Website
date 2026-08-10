import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE } from '@/lib/session';

/**
 * Gate /admin at the edge. The middleware only checks that a session cookie is
 * present — the cryptographic verification happens server-side in the page and
 * the API routes, which is where it actually matters.
 */
export function middleware(request: NextRequest) {
  const hasCookie = Boolean(request.cookies.get(SESSION_COOKIE)?.value);

  if (!hasCookie && request.nextUrl.pathname.startsWith('/admin')) {
    const url = request.nextUrl.clone();
    url.pathname = '/admin';
    url.searchParams.set('auth', 'required');
    // /admin itself renders the login screen, so only redirect deeper routes.
    if (request.nextUrl.pathname !== '/admin') {
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
