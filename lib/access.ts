import { cache } from 'react';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAdminSession, superRole, type AdminSession } from '@/lib/session';
import { resolveSiteRecord } from '@/lib/site';
import type { SiteContent } from '@/lib/site-content';

/**
 * Who may edit the site this request arrived at.
 *
 * `getAdminSession()` answers "is this a real admin?" and its return value was
 * discarded at all thirty-one call sites — it was a pure boolean gate with one
 * global role, which is exactly right while one person owns everything. With
 * two portfolios on one deployment it is no longer the whole question. This
 * file answers the second half: *which* site.
 *
 * Two mechanisms, deliberately different in kind:
 *
 *   * `portfolio-admin` in the JWT stays as it is. Registration on
 *     auth-platform's demo is open, so a valid token on its own means only
 *     "signed up"; the role is what separates an administrator from a stranger.
 *     It is global and it grants nothing by itself any more.
 *
 *   * A `SiteUser` row names the site. It holds a JWT subject and nothing else
 *     — no name, no email, no credential — so this database still contains
 *     nothing anyone could sign in with.
 *
 * `portfolio-superadmin` bypasses the row lookup. It is a role rather than a
 * column because it is a claim about a person, not about a site: a per-site
 * flag would have to be set again for every site that ever exists, and
 * forgetting is how someone locks themselves out of a portfolio they own.
 */

export type AccessLevel = 'super' | 'owner';

export type SiteAccess =
  | { ok: true; session: AdminSession; siteId: string; site: SiteContent; level: AccessLevel }
  /** No valid token, or a token without `portfolio-admin`. Sign in. */
  | { ok: false; reason: 'anonymous' }
  /** A genuine admin, but not of this site — or of no site at all. */
  | { ok: false; reason: 'forbidden'; host: string };

/**
 * The check every admin route and the admin layout runs.
 *
 * `anonymous` and `forbidden` are separate answers because they need opposite
 * treatment. Sending a signed-in admin who simply has no rights here to the
 * sign-in page produces an infinite loop: they authenticate perfectly, come
 * back, and are bounced again. They need to be told, not redirected.
 *
 * Memoised per request: the admin layout and the page it wraps render in the
 * same request, so without this every admin page verifies the token and reads
 * the grant twice.
 */
export const requireSiteAccess = cache(async (): Promise<SiteAccess> => {
  const session = await getAdminSession();
  if (!session) return { ok: false, reason: 'anonymous' };

  const record = await resolveSiteRecord();
  // No site row at this host at all. Treated as forbidden rather than as a
  // server error: there is nothing to edit here, and saying so is more useful
  // than a 500 that reads like a database problem.
  if (!record) return { ok: false, reason: 'forbidden', host: '' };

  const base = { ok: true as const, session, siteId: record.id, site: record.content };

  if (session.roles.includes(superRole())) {
    return { ...base, level: 'super' };
  }

  const grant = await prisma.siteUser.findUnique({
    where: { siteId_authSubject: { siteId: record.id, authSubject: session.userId } },
    select: { id: true },
  });

  if (!grant) return { ok: false, reason: 'forbidden', host: record.content.host };

  return { ...base, level: 'owner' };
});

/**
 * The same check, shaped for a route handler: the site to write to, or the
 * response to return instead.
 *
 * Every `/api/admin/*` handler opens with this, which is why it is one function
 * rather than four lines repeated twenty times — the version that gets the
 * status codes wrong is the one somebody retypes.
 *
 * 401 and 403 are different on purpose. 401 says "sign in", and the admin
 * pages act on it by redirecting; answering 401 to a signed-in admin who
 * simply has no rights on this host sends them round that loop forever.
 */
export async function writerSite(): Promise<
  { ok: true; siteId: string; level: AccessLevel } | { ok: false; response: NextResponse }
> {
  const access = await requireSiteAccess();
  if (access.ok) return { ok: true, siteId: access.siteId, level: access.level };

  return {
    ok: false,
    response:
      access.reason === 'anonymous'
        ? NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        : NextResponse.json({ error: 'You do not have access to this site' }, { status: 403 }),
  };
}
