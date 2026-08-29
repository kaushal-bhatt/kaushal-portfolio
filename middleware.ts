import { NextResponse, type NextRequest } from 'next/server';

/**
 * The admin panel is switched off.
 *
 * Password login is being removed in favour of auth-platform SSO (see
 * IdeaProjects/PORTFOLIO-SSO-PLAN.md). Until that lands there is no way to
 * authenticate — the seeded account has a null password on purpose — so these
 * routes cannot do anything useful, and shipping them would only leave an
 * unauthenticated surface on a public site for no benefit.
 *
 * This runs on the server, which is the point: before this file existed the only
 * gate on /admin was a `'use client'` layout, so the admin UI and its JavaScript
 * were served to anyone who asked for them. The API routes underneath did check
 * `getServerSession` server-side, so no data leaked — but the check belonged
 * here as well.
 *
 * `/api/auth/*` is deliberately NOT blocked: `SessionProvider` wraps the whole
 * site and calls it on every page, and blocking it would break the public pages.
 * It safely returns an empty session.
 *
 * Phase 2 replaces this whole file with a real session check.
 */
export function middleware(request: NextRequest) {
  const isApi = request.nextUrl.pathname.startsWith('/api/');

  if (isApi) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  // A hand-written 404 rather than a rewrite to Next's own not-found page:
  // whether `rewrite` carries a custom status through depends on the Next
  // version, and a page that quietly returns 200 would be worse than plain.
  return new NextResponse(
    '<!doctype html><meta charset="utf-8"><title>Not found</title>' +
      '<body style="font:16px system-ui;padding:3rem"><h1>404</h1>' +
      '<p><a href="/">Back to the site</a></p>',
    { status: 404, headers: { 'content-type': 'text/html; charset=utf-8' } }
  );
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*', '/auth/:path*'],
};
