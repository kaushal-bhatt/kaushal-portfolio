import { Navigation } from '@/components/navigation';
import { HeroSection } from '@/components/hero-section';
import { AboutSection } from '@/components/about-section';
import { PortfolioSection } from '@/components/portfolio-section';
import { BlogSection } from '@/components/blog-section';
import { BookingSection } from '@/components/booking-section';
import { SiteFooter } from '@/components/site-footer';
import { resolveSite } from '@/lib/site';

export default async function Home() {
  const site = await resolveSite();

  /**
   * Structured data describing the person, not the page.
   *
   * This is what lets a search engine connect the site to a name, a job title
   * and the profiles that belong to it — the difference between "some page" and
   * "this is Kaushal Bhatt's site" in a result. `sameAs` is the load-bearing
   * part: it is how the site, the GitHub account and the LinkedIn profile are
   * asserted to be the same person.
   *
   * Every field is dropped when empty rather than emitted blank, because
   * partial structured data is worse than none — a crawler that reads
   * `"name": ""` has learned something wrong.
   */
  const sameAs = [site.linkedinUrl, site.githubUrl].filter(Boolean);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: site.fullName,
    ...(site.headline ? { jobTitle: site.headline } : {}),
    ...(site.metaDescription ? { description: site.metaDescription } : {}),
    ...(site.host ? { url: `https://${site.host}` } : {}),
    ...(site.email ? { email: `mailto:${site.email}` } : {}),
    ...(sameAs.length ? { sameAs } : {}),
  };

  return (
    <main className="min-h-screen bg-slate-900 text-white">
      {/*
        Serialised, and the closing-tag sequence escaped: a headline containing
        `</script>` would otherwise end this element early and put the rest of
        the JSON into the page as markup.
      */}
      {site.fullName && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
        />
      )}

      <Navigation />
      <HeroSection />
      <AboutSection />
      <PortfolioSection />
      <BlogSection />

      {/* Renders nothing at all until a Calendly URL is set in /admin/booking. */}
      <BookingSection />

      <SiteFooter />
    </main>
  );
}
