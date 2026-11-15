'use client';

import Link from 'next/link';
import { useSite } from '@/hooks/use-site';
import { usePublishedResumes } from '@/hooks/use-published-resumes';

/**
 * The colophon.
 *
 * Inverted — the one full-bleed ink band on the page — so the site ends rather
 * than trails off. The surname set large again closes the loop the masthead
 * opened, and the contact line is the last thing a reader sees, which is where
 * the next action belongs.
 *
 * Reads the site through `useSite()` like every other piece of copy, so it
 * cannot render on a different clock from the hero and disagree with it.
 */
export function SiteFooter() {
  const site = useSite();
  const resumes = usePublishedResumes();

  const links = [
    site.email && { label: 'Email', href: `mailto:${site.email}` },
    // The phone number lives on the résumé PDF only — this page is public.
    resumes.length > 0 && { label: 'Résumé', href: '/resume' },
    site.linkedinUrl && { label: 'LinkedIn', href: site.linkedinUrl, external: true },
    site.githubUrl && { label: 'GitHub', href: site.githubUrl, external: true },
  ].filter(Boolean) as { label: string; href: string; external?: boolean }[];

  const year = new Date().getFullYear();
  const words = (site.fullName || '').trim().split(/\s+/).filter(Boolean);
  const surname = words[words.length - 1] ?? '';

  // Paper-on-ink tints, written once.
  const dim = 'oklch(97% 0.01 85 / 0.5)';
  const mid = 'oklch(97% 0.01 85 / 0.72)';

  return (
    <footer style={{ background: 'var(--paper-ink)', color: 'var(--paper)' }}>
      <div className="ed-grid pt-[clamp(4rem,8vw,7rem)]">
        <div className="col-1-7">
          <p className="ed-label mb-6" style={{ color: dim }}>
            Contact
          </p>
          {site.email ? (
            /*
              One size below display, with a break opportunity after the @. An
              address is one long word: at display size it overflows a phone and
              `break-words` would split it mid-letter. <wbr> makes the @ the place
              it gives way, so it reads as local part / domain on two lines.
            */
            <a
              href={`mailto:${site.email}`}
              className="ed-h2 ed-link block break-words"
              style={{ color: 'var(--paper)', fontSize: 'clamp(1.75rem, 4.2vw, 3.75rem)' }}
            >
              {site.email.includes('@') ? (
                <>
                  {site.email.slice(0, site.email.indexOf('@') + 1)}
                  <wbr />
                  {site.email.slice(site.email.indexOf('@') + 1)}
                </>
              ) : (
                site.email
              )}
            </a>
          ) : (
            <p className="ed-display">{site.fullName}</p>
          )}
          {site.footerTagline && (
            <p className="mt-6 max-w-[48ch]" style={{ color: mid }}>
              {site.footerTagline}
            </p>
          )}
        </div>

        <nav aria-label="Footer" className="col-8-12 mt-12 lg:mt-0">
          <p className="ed-label mb-6" style={{ color: dim }}>
            Pages
          </p>
          <ul className="space-y-3">
            {[
              { label: 'About', href: '/#about' },
              { label: 'Experience', href: '/#experience' },
              { label: 'Projects', href: '/portfolio' },
              { label: 'Writing', href: '/blog' },
            ].map((l) => (
              <li key={l.label}>
                <Link href={l.href} className="ed-link" style={{ color: 'var(--paper)' }}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* The surname, very large and cropped by the bottom edge of the page —
          the last thing on the screen and the same face it opened with. */}
      {surname && (
        <div
          aria-hidden="true"
          className="ed-masthead mt-[clamp(3rem,7vw,6rem)] select-none overflow-hidden leading-[0.78]"
          style={{
            paddingInline: 'var(--gutter)',
            color: 'oklch(97% 0.01 85 / 0.08)',
            fontSize: 'clamp(5rem, 24vw, 22rem)',
            height: '0.62em',
          }}
        >
          {surname}
        </div>
      )}

      <div style={{ borderTop: '1px solid oklch(97% 0.01 85 / 0.14)' }}>
        <div className="ed-grid">
          <div className="col-all flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="ed-label ed-mono" style={{ color: dim }}>
              © {year} {site.fullName}
            </p>
            {links.length > 0 && (
              <ul className="flex flex-wrap gap-x-6 gap-y-2">
                {links.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      className="ed-label ed-link"
                      style={{ color: mid }}
                      {...(l.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
