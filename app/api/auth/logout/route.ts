import { NextResponse } from 'next/server';
import { ACCESS_COOKIE, REFRESH_COOKIE, cookieOptions, siteUrl } from '@/lib/session';

export const dynamic = 'force-dynamic';

/**
 * Clears the session cookies.
 *
 * POST, not GET: a GET logout can be fired by any image tag or link on any page, so a visitor
 * could be signed out by something they merely looked at. Harmless here, but it is the same
 * reasoning that makes GET the wrong verb for anything with a side effect.
 *
 * The refresh cookie is cleared by overwriting it with an expired one on its own path — a
 * `delete` without the matching path leaves a cookie set at /api/auth untouched.
 */
export async function POST() {
  const response = NextResponse.redirect(new URL('/', siteUrl()), { status: 303 });
  response.cookies.set(ACCESS_COOKIE, '', cookieOptions(0));
  response.cookies.set(REFRESH_COOKIE, '', cookieOptions(0, '/api/auth'));
  return response;
}
