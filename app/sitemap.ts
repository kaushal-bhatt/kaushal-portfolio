import type { MetadataRoute } from 'next';
import { listPublishedPostRefs } from '@/lib/content/posts';
import { getPublishedResumeLinks } from '@/lib/content/resume';
import { listTopicRefs } from '@/lib/content/topics';
import { resolveSiteRecord } from '@/lib/site';

/**
 * Dynamic, not built once.
 *
 * A sitemap generated at build time would list whatever was published the
 * moment the image was built, and this site's content changes from the admin
 * panel without a deploy — so a static sitemap would be wrong within a day.
 * It also has to be per host: the second portfolio's sitemap must not list the
 * first one's writing.
 */
export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = await resolveSiteRecord();

  // Without a host there is no absolute URL to emit, and a sitemap of relative
  // paths is not a sitemap. Better empty than wrong.
  if (!site?.content.host) return [];
  const base = `https://${site.content.host}`;

  // Every list is scoped to this site, which is the whole point of the sitemap
  // being dynamic: the second portfolio's sitemap must not list the first one's
  // writing, and a crawler that finds it there would have every reason to treat
  // both as one site.
  const [posts, topics, resumes] = await Promise.all([
    listPublishedPostRefs(site.id),
    listTopicRefs(site.id),
    getPublishedResumeLinks(site.id),
  ]);

  const now = new Date();

  return [
    { url: base, lastModified: now, changeFrequency: 'monthly', priority: 1 },
    { url: `${base}/portfolio`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/blog`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },

    // Unpublished résumés are absent for the same reason drafts are: the page
    // 404s, and listing a 404 in a sitemap is a crawl error you asked for.
    ...resumes.map((resume) => ({
      url: `${base}/resume/${resume.slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),

    ...topics.map((topic) => ({
      url: `${base}/blog/technology/${topic.slug}`,
      lastModified: topic.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.5,
    })),

    // The posts are the point of having a sitemap at all — they are the pages
    // nothing else links to deeply.
    ...posts.map((post) => ({
      url: `${base}/blog/post/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ];
}
