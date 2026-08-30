import { cookies } from 'next/headers';
import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose';

/**
 * The admin session.
 *
 * There is no local authentication any more. Sign-in happens on auth-platform, which hands this
 * app a signed JWT through the redirect flow; all this file does is verify that token against
 * the issuer's public keys and check what it grants.
 *
 * Nothing here signs anything, which is the point: the previous design signed its own session
 * cookie with NEXTAUTH_SECRET, and that secret was published in a public repository — enough to
 * forge an admin session without ever seeing a password. A verification-only relying party has
 * no equivalent secret to lose.
 */

export const ACCESS_COOKIE = 'ap_at';
export const REFRESH_COOKIE = 'ap_rt';
export const STATE_COOKIE = 'ap_state';

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    // Fail loudly. The predecessor of this file fell back to a literal
    // ('fallback-secret-key') when its variable was missing, so a misconfigured deploy came up
    // looking healthy while accepting forged sessions. A missing variable must stop the request,
    // not quietly change what "authenticated" means.
    throw new Error(`${name} is not set`);
  }
  return value;
}

/** Public origin — the one a browser is redirected to. */
export const authPlatformUrl = () => required('AUTH_PLATFORM_URL').replace(/\/$/, '');

/**
 * Origin for server-to-server calls: fetching JWKS and exchanging the code.
 *
 * Defaults to the public URL, but in production both services sit on the same host, and going
 * out to the public name to come back in means the container resolves its own box's public IP
 * and hairpins through the proxy. Plenty of Docker and NAT setups will not do that, and the
 * failure is silent — the browser redirect works, and then the token exchange times out with
 * nothing obviously wrong. Pointing this at the service name on the compose network avoids the
 * round trip entirely.
 *
 * Only the transport differs. The token's `iss` and `aud` are still checked against the
 * configured values, so reaching the service by a different name changes nothing about what is
 * accepted.
 */
export const authPlatformInternalUrl = () =>
  (process.env.AUTH_PLATFORM_INTERNAL_URL || required('AUTH_PLATFORM_URL')).replace(/\/$/, '');
export const ssoClientId = () => required('AUTH_PLATFORM_SSO_CLIENT_ID');
export const ssoClientSecret = () => required('AUTH_PLATFORM_SSO_CLIENT_SECRET');
export const siteUrl = () => required('PORTFOLIO_BASE_URL').replace(/\/$/, '');
export const callbackUrl = () => `${siteUrl()}/api/auth/callback`;

const requiredRole = () => process.env.AUTH_PLATFORM_SSO_REQUIRED_ROLE || 'portfolio-admin';

/**
 * `createRemoteJWKSet` fetches the issuer's keys and caches them, re-fetching only when a token
 * arrives with a key id it has not seen. That is what makes key rotation on the auth service a
 * non-event here — this app never holds a copy of anything.
 *
 * Built lazily and memoised: at module scope it would run during `next build`, where
 * AUTH_PLATFORM_URL is deliberately absent.
 */
let jwks: ReturnType<typeof createRemoteJWKSet> | null = null;
function keySet() {
  if (!jwks) {
    jwks = createRemoteJWKSet(new URL(`${authPlatformInternalUrl()}/.well-known/jwks.json`));
  }
  return jwks;
}

export interface AdminSession {
  userId: string;
  email?: string;
  roles: string[];
}

/**
 * Verifies an access token and returns the session it represents, or null.
 *
 * `issuer` and `audience` are checked, not merely read. Without them any token this JWKS could
 * validate would be accepted — including one minted for a different application by the same
 * auth service.
 */
export async function verifyAccessToken(token: string): Promise<AdminSession | null> {
  try {
    const { payload } = await jwtVerify(token, keySet(), {
      issuer: process.env.AUTH_PLATFORM_ISSUER || 'auth-service',
      audience: process.env.AUTH_PLATFORM_AUDIENCE || 'auth-platform-client',
    });
    return toSession(payload);
  } catch {
    // Expired, wrong signature, wrong issuer, unreachable JWKS — all the same answer here.
    // The caller's job is to send the visitor to sign in again, and telling them which of those
    // it was would help nobody but someone probing.
    return null;
  }
}

function toSession(payload: JWTPayload): AdminSession | null {
  if (!payload.sub) return null;
  const roles = Array.isArray(payload.roles) ? payload.roles.map(String) : [];
  return {
    userId: payload.sub,
    email: typeof payload.email === 'string' ? payload.email : undefined,
    roles,
  };
}

/**
 * The authoritative check, for server components and route handlers.
 *
 * Returns null unless there is a valid token AND it carries the required role. Registration on
 * auth-platform's demo is open to anyone, so "presented a valid token" means only "signed up" —
 * the role is the whole of the authorisation decision.
 */
export async function getAdminSession(): Promise<AdminSession | null> {
  const token = cookies().get(ACCESS_COOKIE)?.value;
  if (!token) return null;

  const session = await verifyAccessToken(token);
  if (!session) return null;

  return session.roles.includes(requiredRole()) ? session : null;
}

/**
 * Constrains a post-login destination to a path on this site.
 *
 * A `next` of `https://attacker.example` would turn signing in here into an open redirect — a
 * genuinely useful phishing primitive, precisely because the visitor really did just
 * authenticate somewhere they trust. `//host` is rejected too: browsers read a protocol-relative
 * URL as an absolute one.
 */
export function safeNext(value: string | null | undefined): string {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return '/admin';
  return value;
}

/** Cookie options shared by every session cookie this app sets. */
export function cookieOptions(maxAgeSeconds: number, path = '/') {
  return {
    httpOnly: true,
    // Off on plain http so local development works; a browser silently drops a `Secure` cookie
    // sent over http, which presents as "login does nothing" with no error anywhere.
    secure: siteUrl().startsWith('https://'),
    // Lax, not Strict: the session has to survive the browser arriving here from the redirect on
    // auth-platform, and Strict withholds cookies on a cross-site navigation — the user would
    // land back signed in and immediately be told they are not.
    sameSite: 'lax' as const,
    path,
    maxAge: maxAgeSeconds,
  };
}
