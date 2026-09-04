import type { Metadata } from 'next';
import { resolveSite } from '@/lib/site';

/**
 * This layout exists only to give /portfolio its own title.
 *
 * The page itself is a client component — it filters projects by category in
 * the browser — and a client component cannot export `generateMetadata`. A
 * sibling layout can, and it runs on the server, so this is the standard way to
 * give an interactive page real metadata without rewriting it.
 *
 * Before this, /portfolio, /blog and four other pages all reported the root
 * title verbatim: "Kaushal Bhatt - Senior Backend Engineer". Six pages, one
 * heading, none of them described.
 */
export async function generateMetadata(): Promise<Metadata> {
  const site = await resolveSite();

  const heading = [site.projectsHeading, site.projectsHeadingAccent].filter(Boolean).join(' ');
  const title = heading || 'Projects';

  return {
    title,
    description: site.projectsSubtitle || site.metaDescription,
    alternates: { canonical: '/portfolio' },
    openGraph: {
      title: `${title} — ${site.fullName}`,
      description: site.projectsSubtitle || site.metaDescription,
      url: '/portfolio',
      ...(site.ogImageUrl ? { images: [site.ogImageUrl] } : {}),
    },
  };
}

export default function PortfolioLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
