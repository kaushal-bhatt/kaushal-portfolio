'use client';

import { useSite } from '@/hooks/use-site';
import { ResumeFooterLink } from '@/components/resume-footer-link';

/**
 * Its own component so it can read the site's copy from the shared cache.
 *
 * It could have been read server-side in `app/page.tsx` instead — the root
 * layout is already dynamic — but every other piece of site copy on this page
 * arrives through `useSite()`, and having one element on a different clock
 * means the footer can render before the hero and disagree with it for a frame.
 */
export function SiteFooter() {
  const site = useSite();

  return (
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
            © {new Date().getFullYear()} {site.fullName}
          </p>
          {site.footerTagline && (
            <p className="mt-2 text-sm text-gray-500">{site.footerTagline}</p>
          )}
          <div className="flex justify-center space-x-6 mt-4">
            {site.email && (
              <a
                href={`mailto:${site.email}`}
                className="text-gray-400 hover:text-blue-400 transition-colors"
              >
                Email
              </a>
            )}
            {/*
              The phone number lives on the résumé PDF only — see
              hero-section.tsx. This link hides itself when no résumé is
              published, which is why it is a component and not an anchor.
            */}
            <ResumeFooterLink />
            {site.linkedinUrl && (
              <a
                href={site.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-blue-600 transition-colors"
              >
                LinkedIn
              </a>
            )}
            {site.githubUrl && (
              <a
                href={site.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-purple-400 transition-colors"
              >
                GitHub
              </a>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
