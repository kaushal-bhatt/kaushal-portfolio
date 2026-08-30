import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'node:crypto';
import { STATE_COOKIE, cookieOptions, authPlatformUrl, ssoClientId, callbackUrl, safeNext } from '@/lib/session';

export const dynamic = 'force-dynamic';

/**
 * Starts the sign-in redirect. Everything about authentication happens on auth-platform; this
 * handler only decides where to send the browser and remembers enough to recognise it coming
 * back.
 */
export async function GET(request: NextRequest) {
  const next = safeNext(request.nextUrl.searchParams.get('next'));

  // The CSRF defence for the whole flow. Without it, an attacker can run a sign-in of their own
  // and hand the victim the resulting callback URL, which would log the victim into the
  // ATTACKER's account — and anything the victim then wrote would be written there.
  const state = randomBytes(32).toString('base64url');

  const authorize = new URL(`${authPlatformUrl()}/sso/authorize`);
  authorize.searchParams.set('client_id', ssoClientId());
  authorize.searchParams.set('redirect_uri', callbackUrl());
  authorize.searchParams.set('state', state);

  const response = NextResponse.redirect(authorize);
  // The state and the post-login destination ride in one httpOnly cookie: the destination must
  // survive the round trip, and putting it in the URL would let anyone choose where a freshly
  // signed-in visitor lands.
  response.cookies.set(STATE_COOKIE, `${state}:${next}`, cookieOptions(600));
  return response;
}

