import { NextResponse, type NextRequest } from 'next/server';

/**
 * Gates the admin area.
 *
 * What this deliberately does NOT do is decide whether a token is genuine. Middleware runs on
 * the Edge runtime, where Next.js inlines `process.env` at build time — so verifying signatures
 * here would mean baking the auth service's configuration, and eventually a secret, into the
 * image. It reads the expiry out of the token without checking anything, purely to choose
 * between "refresh" and "let through".
 *
 * The real check is `getAdminSession()` in lib/session.ts, which runs server-side with runtime
 * configuration and verifies the signature, the issuer, the audience and the required role.
 * Every `/api/admin/*` handler and the admin pages call it. This file is routing, not
 * authorisation: a forged token gets past here and is refused there.
 *
 * That split is also why the previous arrangement was wrong in the other direction — the only
 * gate on /admin was a `'use client'` layout, so the admin UI was served to anyone who asked.
 */
export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const isApi = pathname.startsWith('/api/');
  const token = request.cookies.get('ap_at')?.value;

  if (token && !isExpired(token)) {
    return NextResponse.next();
  }

  if (isApi) {
    // An API caller gets a status, not a redirect to an HTML sign-in page it cannot use.
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Always via refresh, never straight to sign-in. The refresh cookie is scoped to /api/auth so
  // the browser does not send it here — this middleware cannot tell whether one exists. The
  // refresh route can, and falls through to sign-in when it does not, so a returning visitor
  // with a live session is not made to authenticate again.
  const refresh = request.nextUrl.clone();
  refresh.pathname = '/api/auth/refresh';
  refresh.search = '';
  refresh.searchParams.set('next', pathname + search);
  return NextResponse.redirect(refresh);
}

/**
 * Reads `exp` out of the payload without verifying anything.
 *
 * Safe only because the answer is used to pick a redirect, never to grant access: the worst a
 * forged `exp` buys is being allowed as far as the server-side check that rejects it. Anything
 * unparseable counts as expired — the failure should be "sign in again", not "let through".
 */
function isExpired(token: string): boolean {
  try {
    const payload = token.split('.')[1];
    if (!payload) return true;
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    const { exp } = JSON.parse(json) as { exp?: number };
    if (typeof exp !== 'number') return true;
    // A few seconds of slack so a token that expires mid-flight is refreshed rather than
    // arriving at the server just too late and bouncing the visitor.
    return exp * 1000 <= Date.now() + 5000;
  } catch {
    return true;
  }
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
