import type { Metadata } from 'next';
import { resolveSite } from '@/lib/site';

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

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
