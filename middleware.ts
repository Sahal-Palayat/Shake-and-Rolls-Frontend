import { NextResponse, type NextRequest } from 'next/server';
import { COOKIE_NAME, parseHint, RIDER_LOGIN_PATH, STAFF_HOME, STAFF_LOGIN_PATH, staffPathAllowed } from '@/features/auth/access';

/**
 * Redirects only. The API enforces every permission; this keeps people out of screens they cannot use.
 * Reads the role:expiry hint cookie (no token in it).
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hint = parseHint(req.cookies.get(COOKIE_NAME)?.value, Date.now());
  const to = (path: string, next?: string) => {
    const url = req.nextUrl.clone();
    url.pathname = path;
    url.search = next ? `?next=${encodeURIComponent(next)}` : '';
    return NextResponse.redirect(url);
  };

  if (pathname.startsWith('/rider')) {
    if (pathname === RIDER_LOGIN_PATH) return NextResponse.next();
    return hint?.role === 'rider' ? NextResponse.next() : to(RIDER_LOGIN_PATH, pathname);
  }

  // /staff/*
  if (pathname === STAFF_LOGIN_PATH) {
    return hint && staffPathAllowed(hint.role, STAFF_HOME) ? to(STAFF_HOME) : NextResponse.next();
  }
  if (!hint) return to(STAFF_LOGIN_PATH, pathname);
  if (!staffPathAllowed(hint.role, pathname)) return to(staffPathAllowed(hint.role, STAFF_HOME) ? STAFF_HOME : STAFF_LOGIN_PATH);
  if (pathname === '/staff') return to(STAFF_HOME);
  return NextResponse.next();
}

export const config = { matcher: ['/staff/:path*', '/rider/:path*'] };
