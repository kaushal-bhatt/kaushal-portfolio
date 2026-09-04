import { Navigation } from '@/components/navigation';
import { HeroSection } from '@/components/hero-section';
import { AboutSection } from '@/components/about-section';
import { PortfolioSection } from '@/components/portfolio-section';
import { BlogSection } from '@/components/blog-section';
import { BookingSection } from '@/components/booking-section';
import { SiteFooter } from '@/components/site-footer';

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-900 text-white">
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
