import { NextRequest, NextResponse } from 'next/server';
import {
  ACCESS_COOKIE, REFRESH_COOKIE,
  cookieOptions, authPlatformInternalUrl, siteUrl, safeNext,
} from '@/lib/session';

export const dynamic = 'force-dynamic';

const REFRESH_MAX_AGE = 30 * 24 * 60 * 60;

/**
 * Trades the refresh token for a new pair and returns the visitor to where they were going.
 *
 * Access tokens last about fifteen minutes, which for an admin panel used occasionally means
 * almost every visit would otherwise begin with a full sign-in. The middleware sends expired
 * sessions here first, and only falls back to sign-in when this fails.
 *
 * auth-platform rotates the refresh token on every use, so the old one is dead the moment this
 * succeeds — which is exactly why a failure here has to clear both cookies rather than leave a
 * spent credential in the browser to be retried forever.
 */
export async function GET(request: NextRequest) {
  const next = safeNext(request.nextUrl.searchParams.get('next'));
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;

  if (!refreshToken) {
    return toLogin(next);
  }

  try {
    const res = await fetch(`${authPlatformInternalUrl()}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
      cache: 'no-store',
    });
    if (!res.ok) return toLogin(next);

    const tokens = await res.json();
    if (!tokens.accessToken || !tokens.refreshToken) return toLogin(next);

    const response = NextResponse.redirect(new URL(next, siteUrl()));
    response.cookies.set(ACCESS_COOKIE, tokens.accessToken, cookieOptions(tokens.expiresIn ?? 900));
    response.cookies.set(REFRESH_COOKIE, tokens.refreshToken, cookieOptions(REFRESH_MAX_AGE, '/api/auth'));
    return response;
  } catch {
    // The auth service being unreachable is not a reason to keep a session the app cannot
    // verify. Send them to sign in; if the service is down, that is where they will find out.
    return toLogin(next);
  }
}

function toLogin(next: string) {
  const login = new URL('/api/auth/login', siteUrl());
  login.searchParams.set('next', next);
  const response = NextResponse.redirect(login);
  response.cookies.delete(ACCESS_COOKIE);
  response.cookies.set(REFRESH_COOKIE, '', cookieOptions(0, '/api/auth'));
  return response;
}
