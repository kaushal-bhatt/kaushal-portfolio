
import { Navigation } from '@/components/navigation';
import { HeroSection } from '@/components/hero-section';
import { AboutSection } from '@/components/about-section';
import { PortfolioSection } from '@/components/portfolio-section';
import { BlogSection } from '@/components/blog-section';

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-900 text-white">
      <Navigation />
      <HeroSection />
      <AboutSection />
      <PortfolioSection />
      <BlogSection />
      
      {/* Footer */}
      <footer className="py-12 bg-slate-900 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/*
              This used to say "Built with Next.js and passion for great
              software", which every portfolio footer says and which tells a
              reader nothing. What is actually true here is more interesting and
              costs the same line.
            */}
            <p className="text-gray-400">
              © {new Date().getFullYear()} Kaushal Bhatt
            </p>
            <p className="mt-2 text-sm text-gray-500 max-w-2xl mx-auto">
              Next.js and Postgres on one box I run myself &mdash; Caddy terminating TLS for three
              domains, four containers, deployed by CI on every push to <code className="text-gray-400">main</code>.
              The admin panel holds no credentials: it signs in with a passkey, through my own
              auth service.
            </p>
            <div className="flex justify-center space-x-6 mt-4">
              <a
                href="mailto:kaushalbhatt28650@gmail.com"
                className="text-gray-400 hover:text-blue-400 transition-colors"
              >
                Email
              </a>
              {/* The phone number lives on the résumé PDF only — see hero-section.tsx. */}
              <a
                href="/resume"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-green-400 transition-colors"
              >
                Résumé
              </a>
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
