import { NextRequest, NextResponse } from 'next/server';
import {
  ACCESS_COOKIE, REFRESH_COOKIE, STATE_COOKIE,
  cookieOptions, authPlatformInternalUrl, ssoClientId, ssoClientSecret, callbackUrl, siteUrl,
} from '@/lib/session';

export const dynamic = 'force-dynamic';

/** 30 days, matching auth-platform's refresh-token lifetime. */
const REFRESH_MAX_AGE = 30 * 24 * 60 * 60;

/**
 * Where auth-platform sends the browser back, carrying a one-time code.
 *
 * The code is exchanged for tokens here, server to server, using the client secret — which is
 * exactly why a code rather than a token travelled through the browser: a code in a URL is
 * worthless to anyone who does not also hold that secret.
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const code = params.get('code');
  const returnedState = params.get('state');

  const cookie = request.cookies.get(STATE_COOKIE)?.value;
  if (!code || !returnedState || !cookie) {
    return fail('This sign-in link is incomplete or has expired. Please try again.');
  }

  // `state` was generated in /api/auth/login and stored httpOnly. If what comes back does not
  // match, this callback was not started by this browser and must not be honoured.
  const separator = cookie.indexOf(':');
  const expectedState = cookie.slice(0, separator);
  const next = cookie.slice(separator + 1) || '/admin';
  if (returnedState !== expectedState) {
    return fail('Sign-in could not be verified. Please try again.');
  }

  let tokens: { accessToken?: string; refreshToken?: string; expiresIn?: number };
  try {
    const res = await fetch(`${authPlatformInternalUrl()}/sso/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: ssoClientId(),
        client_secret: ssoClientSecret(),
        code,
        // Sent again so the auth service can require it to match the URI the code was minted
        // for. It refuses otherwise.
        redirect_uri: callbackUrl(),
      }),
      cache: 'no-store',
    });
    if (!res.ok) return fail('Sign-in was refused. Please try again.');
    tokens = await res.json();
  } catch {
    return fail('Could not reach the sign-in service. Please try again.');
  }

  if (!tokens.accessToken || !tokens.refreshToken) {
    return fail('Sign-in did not complete. Please try again.');
  }

  const response = NextResponse.redirect(new URL(next, siteUrl()));
  response.cookies.set(ACCESS_COOKIE, tokens.accessToken, cookieOptions(tokens.expiresIn ?? 900));
  // Scoped to /api/auth so it is not attached to ordinary page requests. It is the
  // longer-lived of the two credentials and has no business travelling with every asset.
  response.cookies.set(REFRESH_COOKIE, tokens.refreshToken, cookieOptions(REFRESH_MAX_AGE, '/api/auth'));
  response.cookies.delete(STATE_COOKIE);
  return response;
}

/**
 * Every failure reads the same and none of them redirects onward. The state cookie is cleared
 * so a half-finished attempt cannot be resumed.
 */
function fail(message: string) {
  const response = new NextResponse(
    `<!doctype html><meta charset="utf-8"><title>Sign-in failed</title>` +
      `<body style="font:16px system-ui;padding:3rem;max-width:32rem">` +
      `<h1 style="font-size:1.2rem">Sign-in failed</h1><p>${message}</p>` +
      `<p><a href="/api/auth/login">Try again</a></p>`,
    { status: 400, headers: { 'content-type': 'text/html; charset=utf-8' } }
  );
  response.cookies.delete(STATE_COOKIE);
  return response;
}
