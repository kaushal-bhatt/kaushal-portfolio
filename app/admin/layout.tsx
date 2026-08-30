import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getAdminSession } from '@/lib/session';

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
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();

  if (!session) {
    redirect('/api/auth/login?next=/admin');
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="border-b border-slate-700 bg-slate-800">
        <div className="mx-auto flex h-12 max-w-7xl items-center justify-between px-4 text-sm sm:px-6 lg:px-8">
          <Link href="/admin" className="font-medium text-slate-200 hover:text-white">
            Admin
          </Link>
          <div className="flex items-center gap-4 text-slate-400">
            <span>{session.email}</span>
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
