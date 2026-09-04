import { headers } from 'next/headers';
import { prisma } from '@/lib/db';
import { SITE_DEFAULTS, type SiteContent } from '@/lib/site-content';

/**
 * Reading the site for a request. Server only — it touches `next/headers` and
 * Prisma, so a client component must import `lib/site-content` instead.
 *
 * The important thing here is `resolveSite()`. There is one row today and it
 * will always be the one that comes back — but the lookup is by host, and that
 * is the seam. When a second portfolio arrives it is a row and a DNS record,
 * not a rewrite of every route.
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

/**
 * The site for this request.
 *
 * Falls back to the row marked `isDefault` when the host matches nothing, and
 * to `SITE_DEFAULTS` when the table is empty — so a fresh database renders an
 * empty site rather than throwing on `site.fullName`.
 */
export async function resolveSite(host?: string): Promise<SiteContent> {
  const wanted = host ?? requestHost();

  const row =
    (wanted ? await prisma.site.findUnique({ where: { host: wanted } }) : null) ??
    (await prisma.site.findFirst({ where: { isDefault: true } })) ??
    (await prisma.site.findFirst({ orderBy: { createdAt: 'asc' } }));

  if (!row) return { ...SITE_DEFAULTS };

  // Listed rather than spread: `Site` carries `id`, `isDefault` and the
  // timestamps, none of which belong in a payload sent to the browser.
  return {
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
  };
}

