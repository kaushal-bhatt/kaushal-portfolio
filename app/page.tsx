
import { Navigation } from '@/components/navigation';
import { HeroSection } from '@/components/hero-section';
import { AboutSection } from '@/components/about-section';
import { PortfolioSection } from '@/components/portfolio-section';
import { BlogSection } from '@/components/blog-section';
import { BookingSection } from '@/components/booking-section';
import { ResumeFooterLink } from '@/components/resume-footer-link';

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

      {/* Footer */}
      <footer className="py-12 bg-slate-900 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/*
              This used to say "Built with Next.js and passion for great
              software", which every portfolio footer says. It is not the place
              for a stack listing either — a footer gets one line, and the one
              worth spending it on is what the reader should do next.
            */}
            <p className="text-gray-400">
              © {new Date().getFullYear()} Kaushal Bhatt
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Designed, built and run by me &mdash; open to Senior Backend Engineer roles across the EU.
            </p>
            <div className="flex justify-center space-x-6 mt-4">
              <a
                href="mailto:kaushalbhatt28650@gmail.com"
                className="text-gray-400 hover:text-blue-400 transition-colors"
              >
                Email
              </a>
              {/*
                The phone number lives on the résumé PDF only — see
                hero-section.tsx. This link hides itself when no résumé is
                published, which is why it is a component and not an anchor.
              */}
              <ResumeFooterLink />
              <a
                href="https://www.linkedin.com/in/kaushal-bhatt-5aa73511b/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-blue-600 transition-colors"
              >
                LinkedIn
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
