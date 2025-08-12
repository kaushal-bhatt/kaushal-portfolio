
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
            <p className="text-gray-400">
              © 2024 Kaushal Bhatt. Built with Next.js and passion for great software.
            </p>
            <div className="flex justify-center space-x-6 mt-4">
              <a 
                href="mailto:kaushal8650@gmail.com" 
                className="text-gray-400 hover:text-blue-400 transition-colors"
              >
                Email
              </a>
              <a 
                href="tel:+918126270902" 
                className="text-gray-400 hover:text-green-400 transition-colors"
              >
                Phone
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
