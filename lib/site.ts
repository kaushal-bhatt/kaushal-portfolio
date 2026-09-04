import { cache } from 'react';
import { headers } from 'next/headers';
import { prisma } from '@/lib/db';
import { SITE_DEFAULTS, type SiteContent } from '@/lib/site-content';

/**
 * Reading the site for a request. Server only — it touches `next/headers` and
 * Prisma, so a client component must import `lib/site-content` instead.
 *
 * This is where every request finds out whose portfolio it is on. One
 * deployment answers on more than one hostname, and the only thing separating
 * the two sites is the `siteId` that starts here and is threaded through every
 * function in `lib/content/`.
 *
 * The rule those modules follow: **`siteId` is the first required argument of
 * every exported read and write.** There is no Prisma middleware and no
 * implicit filter — a route that forgets the site does not compile, which is
 * the only kind of enforcement that survives someone adding a route in a hurry.
 * A missing filter is not an error at runtime: it quietly returns the other
 * person's rows, and it looks like working code in review.
 */

// Re-exported so a server component needs one import rather than two.
export * from '@/lib/site-content';

/**
 * The hostname this request was made to, without the port.
 *
 * Caddy passes the original `Host` through on `reverse_proxy`, so this is the
 * name the visitor typed rather than the container's. `x-forwarded-host` is
 * checked first because a different proxy in front would use it — and it is
 * read here rather than trusted for anything security-relevant: the worst a
 * forged value can do is select a site that does not exist, which falls back.
 */
export function requestHost(): string {
  const headerList = headers();
  const raw = headerList.get('x-forwarded-host') ?? headerList.get('host') ?? '';
  return raw.split(',')[0].trim().split(':')[0].toLowerCase();
}

/** A site's id alongside the fields the page renders. */
export interface SiteRecord {
  id: string;
  content: SiteContent;
}

/**
 * The site row for this request, id included.
 *
 * Falls back to the row marked `isDefault` when the host matches nothing, and
 * to null when the table is empty — a database nothing has been seeded into has
 * no sites, and therefore no content belonging to one.
 *
 * Wrapped in React's `cache()` because almost every request resolves the site
 * more than once: the root layout's `generateMetadata`, the page body, and each
 * content read that needs an id. Without it that is four identical queries per
 * page. `lib/content/posts.ts` memoises for the same reason.
 */
export const resolveSiteRecord = cache(async (host?: string): Promise<SiteRecord | null> => {
  const wanted = host ?? requestHost();

  const row =
    (wanted ? await prisma.site.findUnique({ where: { host: wanted } }) : null) ??
    (await prisma.site.findFirst({ where: { isDefault: true } })) ??
    (await prisma.site.findFirst({ orderBy: { createdAt: 'asc' } }));

  if (!row) return null;

  // Listed rather than spread: `Site` carries `id`, `isDefault` and the
  // timestamps, none of which belong in a payload sent to the browser. The id
  // travels beside the content rather than inside it for exactly that reason —
  // `/api/site` returns the content and nothing else.
  return {
    id: row.id,
    content: {
      host: row.host,
      fullName: row.fullName,
      headline: row.headline,
      locationLine: row.locationLine,
      navBrand: row.navBrand,

      heroGreeting: row.heroGreeting,
      heroIntro: row.heroIntro,
      primaryCtaLabel: row.primaryCtaLabel,
      demoUrl: row.demoUrl,
      demoLabel: row.demoLabel,

      email: row.email,
      linkedinUrl: row.linkedinUrl,
      githubUrl: row.githubUrl,

      footerTagline: row.footerTagline,

      experienceHeading: row.experienceHeading,
      experienceHeadingAccent: row.experienceHeadingAccent,
      experienceSubtitle: row.experienceSubtitle,

      projectsHeading: row.projectsHeading,
      projectsHeadingAccent: row.projectsHeadingAccent,
      projectsSubtitle: row.projectsSubtitle,

      blogHeading: row.blogHeading,
      blogHeadingAccent: row.blogHeadingAccent,
      blogSubtitle: row.blogSubtitle,

      blogPageHeading: row.blogPageHeading,
      blogPageHeadingAccent: row.blogPageHeadingAccent,
      blogPageSubtitle: row.blogPageSubtitle,

      contactHeading: row.contactHeading,
      contactSubtitle: row.contactSubtitle,

      metaTitle: row.metaTitle,
      metaDescription: row.metaDescription,
      metaKeywords: row.metaKeywords,
      ogImageUrl: row.ogImageUrl,

      accent: row.accent,
    },
  };
});

/**
 * The site's wording, for anything that renders rather than queries.
 *
 * Still returns `SITE_DEFAULTS` on an empty database — a fresh install should
 * come up as a blank portfolio rather than throw on `site.fullName`.
 */
export async function resolveSite(host?: string): Promise<SiteContent> {
  const record = await resolveSiteRecord(host);
  return record ? record.content : { ...SITE_DEFAULTS };
}

/**
 * The id every `lib/content/` call needs, or null on a database with no sites.
 *
 * Null is a real answer and not an error: it means this deployment has no
 * portfolio at this address yet. Callers render an empty section rather than a
 * 500, which is what a half-installed site should look like.
 */
export async function currentSiteId(): Promise<string | null> {
  return (await resolveSiteRecord())?.id ?? null;
}

/**
 * Whether a hostname belongs to a site here.
 *
 * Used by `lib/session.ts` to decide the origin for the SSO round trip. The
 * `Host` header is caller-controlled, so building a `redirect_uri` straight
 * from it would let anyone name the address a sign-in comes back to.
 * auth-platform compares `redirect_uri` by exact string equality against its
 * own list and would refuse the forged one — but relying on that means this
 * app's correctness lives in another service's configuration file. Checking the
 * host against the sites that actually exist keeps the answer here.
 */
export async function isKnownHost(host: string): Promise<boolean> {
  if (!host) return false;
  return (await prisma.site.findUnique({ where: { host }, select: { id: true } })) !== null;
}

/**
 * Saves a site, addressed by its id.
 *
 * By id and never by host, because the host is the thing being edited: moving
 * this site to a new domain is a legitimate change, and a `where: { host }`
 * would either miss the row or, worse, find somebody else's. The caller has
 * already established which site it may write — see `lib/access.ts`.
 *
 * There is no create branch. A site has to exist before it can be edited,
 * because there is no way to decide who may edit one that is not there; the
 * first row is inserted by SQL alongside its owner's grant. The upsert this
 * replaced would, with two hosts live, have let a request to an unrecognised
 * name conjure a third site.
 */
export async function saveSite(siteId: string, value: SiteContent): Promise<void> {
  await prisma.site.update({ where: { id: siteId }, data: value });
}

/** Whether another site already answers on this host. */
export async function hostTaken(host: string, excludeSiteId: string): Promise<boolean> {
  const row = await prisma.site.findUnique({ where: { host }, select: { id: true } });
  return row !== null && row.id !== excludeSiteId;
}

