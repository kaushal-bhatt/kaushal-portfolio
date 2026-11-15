import type { Metadata } from 'next';
import { Inter, Instrument_Serif, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import './editorial.css';
import { Providers } from '@/components/providers';
import { SiteProvider } from '@/components/site-provider';
import { accentClass, resolveSite } from '@/lib/site';

/**
 * Three families, each with one job.
 *
 * Instrument Serif is the voice — the name, the section heads, the numerals.
 * Inter is everything you read for longer than a line. JetBrains Mono is the
 * apparatus: dates, labels, folios, the stack. Exposed as CSS variables rather
 * than classes so `app/editorial.css` can reach them, and self-hosted by
 * next/font so there is no request to Google and no layout shift on load.
 */
const inter = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });

const display = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
});

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
    // `dark` stays on <html>, and alone. It is what the admin panel's shadcn
    // components read, and next-themes removes and re-adds it before React
    // hydrates — with anything else in the attribute that reorders the class
    // list, and the server and client HTML disagree. The public pages opt into
    // paper with `.editorial` on their own wrapper, so the CMS look is untouched.
    <html lang="en" className="dark">
      {/*
        The font variables and the accent class sit on <body>: custom properties
        inherit to every element below it, and one attribute here sets the
        signal colour for the whole page — see `.accent-*` in app/editorial.css.
      */}
      <body
        className={`${inter.className} ${inter.variable} ${display.variable} ${mono.variable} ${accentClass(site.accent)}`}
      >
        {/*
          The site resolved above, for this request's host, handed to every
          client component — so the name, the nav brand and the headings are in
          the server HTML rather than filled in after a client fetch. See
          components/site-provider.tsx.
        */}
        <SiteProvider value={site}>
          <Providers>{children}</Providers>
        </SiteProvider>
      </body>
    </html>
  );
}
