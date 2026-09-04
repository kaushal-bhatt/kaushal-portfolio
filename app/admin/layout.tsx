import { redirect } from 'next/navigation';
import Link from 'next/link';
import { requireSiteAccess } from '@/lib/access';

export const dynamic = 'force-dynamic';

/**
 * Wraps every admin page.
 *
 * This is a server component and the check runs on the server. The previous version was
 * `'use client'` and gated on `useSession()`, which meant the admin UI and all of its
 * JavaScript were served to anyone who asked for /admin — the browser then decided whether to
 * render it. The API routes underneath did check properly, so no data leaked, but the check
 * belonged here too.
 *
 * Middleware has already redirected an expired or missing session before this runs; this is the
 * check that actually verifies the token's signature, issuer, audience and role. The redirect
 * here is the backstop for the case where middleware let something through.
 *
 * The two failures are handled differently on purpose. Nobody signed in is a redirect to sign
 * in. Somebody signed in who has no rights on THIS host is told so — redirecting them would
 * send them round the sign-in loop forever, authenticating correctly every time and arriving
 * back at the same refusal.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const access = await requireSiteAccess();

  if (!access.ok && access.reason === 'anonymous') {
    redirect('/api/auth/login?next=/admin');
  }

  if (!access.ok) {
    return <NoAccess host={access.host} />;
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="border-b border-slate-700 bg-slate-800">
        <div className="mx-auto flex h-12 max-w-7xl items-center justify-between px-4 text-sm sm:px-6 lg:px-8">
          <Link href="/admin" className="font-medium text-slate-200 hover:text-white">
            Admin
          </Link>
          <div className="flex items-center gap-4 text-slate-400">
            {/*
              The host, not decoration. One deployment serves two portfolios and
              the panels are identical to look at — knowing which site a save is
              about to change belongs on screen, not in the address bar.
            */}
            <span className="hidden sm:inline text-slate-500">
              {access.site.host}
              {access.level === 'super' ? ' · super' : ''}
            </span>
            <span>{access.session.email}</span>
            {/*
              A form, not a link: a GET logout can be triggered by any image or
              prefetch on any page, so a visitor could be signed out by something
              they only looked at.
            */}
            <form action="/api/auth/logout" method="post">
              <button type="submit" className="hover:text-white">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}

/**
 * A verified admin with no grant on this site.
 *
 * Deliberately a page rather than a redirect, and deliberately says which host
 * refused them: with two portfolios on one deployment, arriving at the wrong
 * one is the likely mistake, and "you do not have access" without naming the
 * site is a message that helps nobody diagnose it.
 *
 * Sign-out is here because it is the only useful action on this page — the way
 * to a site you do own is a different session, or a different address.
 */
function NoAccess({ host }: { host: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold text-white">This is not your site</h1>
        <p className="mt-3 text-sm text-slate-400">
          You are signed in, but your account has no access to{' '}
          <span className="text-slate-200">{host || 'this address'}</span>. If it should, the
          owner grants it by adding you to that site.
        </p>
        <div className="mt-6 flex items-center justify-center gap-4 text-sm">
          <Link href="/" className="text-slate-400 hover:text-white">
            Back to the site
          </Link>
          <form action="/api/auth/logout" method="post">
            <button type="submit" className="text-slate-400 hover:text-white">
              Sign out
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
