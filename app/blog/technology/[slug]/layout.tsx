import type { Metadata } from 'next';
import { getTopic } from '@/lib/content/topics';
import { resolveSiteRecord } from '@/lib/site';

/**
 * One title per topic.
 *
 * These pages are the closest this site has to subject pages — "Kafka
 * articles", "PostgreSQL articles" — and they all reported the site's own
 * title, so they competed with each other and with the blog index for the same
 * result.
 *
 * The page under this is a client component; the layout is how it gets metadata
 * without being rewritten. See the note in app/portfolio/layout.tsx.
 */
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const record = await resolveSiteRecord();
  const section = record && (await getTopic(record.id, params.slug));

  // The page renders its own "Technology Not Found" state, so this only has to
  // avoid putting "undefined" in a tab on the way there. A topic belonging to
  // the other portfolio lands here too, which is right: it does not exist at
  // this address.
  if (!record || !section) return { title: 'Topic not found' };

  const site = record.content;
  const title = `${section.name} Articles`;
  const description =
    section.description || `Articles about ${section.name} by ${site.fullName}.`;

  return {
    title,
    description,
    alternates: { canonical: `/blog/technology/${section.slug}` },
    openGraph: {
      title: `${title} — ${site.fullName}`,
      description,
      url: `/blog/technology/${section.slug}`,
      ...(site.ogImageUrl ? { images: [site.ogImageUrl] } : {}),
    },
  };
}

export default function TechnologyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
