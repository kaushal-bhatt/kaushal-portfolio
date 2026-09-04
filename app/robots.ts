import type { MetadataRoute } from 'next';
import { resolveSite } from '@/lib/site';

/**
 * Dynamic for the same reason the sitemap is: the `Sitemap:` line has to name
 * the host the request arrived on, and with two portfolios that is two
 * different answers from one deployment.
 */
export const dynamic = 'force-dynamic';

export default async function robots(): Promise<MetadataRoute.Robots> {
  const site = await resolveSite();

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // The admin panel and its API are already session-guarded, so this is not
      // what protects them — it keeps them out of an index where they would
      // only ever produce a sign-in redirect. `/api/` is disallowed for the
      // same reason: JSON in a search result helps nobody.
      disallow: ['/admin', '/api/'],
    },
    ...(site.host ? { sitemap: `https://${site.host}/sitemap.xml` } : {}),
  };
}
