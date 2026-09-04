import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { accentClass, resolveSite } from '@/lib/site';

const inter = Inter({ subsets: ['latin'] });

/**
 * Reads the database through `resolveSite()`, so the whole app is rendered on
 * demand rather than prerendered.
 *
 * That is a real change and worth naming: every page under this layout used to
 * be static. Almost nothing is lost — the pages already fetched all of their
 * content from `/api/*` in the browser, so the "static" shell was an empty one.
 * What is gained is that the title, the description and the link preview are
 * per site, which is the whole point of the frame being data.
 */
export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const site = await resolveSite();

  // Falls back through to something sensible rather than rendering "undefined"
  // in a tab. A site with no name at all is a fresh database, not a bug worth
  // crashing the page over.
  const title =
    site.metaTitle || [site.fullName, site.headline].filter(Boolean).join(' — ') || 'Portfolio';
  const description = site.metaDescription || site.headline || '';
  const images = site.ogImageUrl ? [site.ogImageUrl] : undefined;

  return {
    title,
    description,
    keywords: site.metaKeywords,
    authors: site.fullName ? [{ name: site.fullName }] : undefined,
    // Absolute URLs in Open Graph are required by most consumers, and this is
    // the only place that knows which host the request came in on.
    metadataBase: site.host ? new URL(`https://${site.host}`) : undefined,
    openGraph: { title, description, type: 'website', locale: 'en_US', images },
    twitter: { card: 'summary_large_image', title, description, images },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const site = await resolveSite();

  return (
    <html lang="en" className="dark">
      {/*
        The accent class sits on <body> so one attribute re-colours every
        `.gradient-text` on the page — the nav brand, the hero name and every
        section heading's second half.
      */}
      <body className={`${inter.className} ${accentClass(site.accent)}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
