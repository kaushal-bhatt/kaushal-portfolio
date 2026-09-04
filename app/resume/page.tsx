import { notFound, redirect } from 'next/navigation';
import { getPrimaryPublishedSlug } from '@/lib/content/resume';
import { currentSiteId } from '@/lib/site';

/**
 * Reads the database, so it cannot be prerendered — `next build` runs in an
 * image with no database in front of it.
 */
export const dynamic = 'force-dynamic';

/**
 * A bare /resume is an alias, not a page.
 *
 * Every document lives at /resume/<slug> and nowhere else, so there is one
 * canonical address per résumé — rendering the primary one here as well would
 * publish the same document at two URLs. This address stays because it is
 * short, it is what goes in the navigation, and it is what anyone types.
 *
 * Which one it lands on is decided by `order`, with `updatedAt` breaking ties.
 */
export default async function ResumeIndex() {
  const siteId = await currentSiteId();
  const slug = siteId && (await getPrimaryPublishedSlug(siteId));

  // Nothing published: the résumé does not exist as far as the public site is
  // concerned, and every link to it is hidden for the same reason. A site with
  // no CV of its own does not fall through to the other portfolio's.
  if (!slug) notFound();

  redirect(`/resume/${slug}`);
}
