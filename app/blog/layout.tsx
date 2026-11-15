import type { Metadata } from 'next';
import { resolveSite } from '@/lib/site';
import { EditorialShell } from '@/components/editorial/editorial-shell';

/**
 * Metadata for /blog. Same reason as the portfolio layout: the page searches
 * and filters in the browser, so it is a client component and cannot export
 * `generateMetadata` itself.
 *
 * This covers /blog only. The post pages and the topic pages are their own
 * routes with their own metadata — nesting a layout does not override a child's
 * title.
 */
export async function generateMetadata(): Promise<Metadata> {
  const site = await resolveSite();

  const heading = [site.blogPageHeading, site.blogPageHeadingAccent].filter(Boolean).join(' ');
  const title = heading || 'Blog';

  return {
    title,
    description: site.blogPageSubtitle || site.metaDescription,
    alternates: { canonical: '/blog' },
    openGraph: {
      title: `${title} — ${site.fullName}`,
      description: site.blogPageSubtitle || site.metaDescription,
      url: '/blog',
      ...(site.ogImageUrl ? { images: [site.ogImageUrl] } : {}),
    },
  };
}

/**
 * The frame for all three blog routes — the index, a topic and an essay — so
 * none of them can forget the paper, the bar or the colophon.
 */
export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <EditorialShell>{children}</EditorialShell>;
}
