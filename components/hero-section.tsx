'use client';

import { Fragment } from 'react';
import { usePublishedResumes } from '@/hooks/use-published-resumes';
import { useSite } from '@/hooks/use-site';
import { renderMarkdown } from '@/lib/markdown';

/**
 * The masthead.
 *
 * The name is the image. It is set at up to ~190px in the display face, left
 * aligned and hung off the first column, with one word per line — so the page
 * opens on a shape rather than on a centred block of text, which is what every
 * template opens on. The full stop after the surname is the only colour above
 * the fold.
 *
 * Everything that varies per site still comes from the `Site` row: the
 * greeting, the headline, the location, the intro and the buttons. A field
 * left empty in /admin/site removes its element rather than leaving a gap.
 */
export function HeroSection() {
  const site = useSite();
  const resumes = usePublishedResumes();

  const words = (site.fullName || '').trim().split(/\s+/).filter(Boolean);
  const year = new Date().getFullYear();

  const contacts = [
    site.email && { label: 'Email', href: `mailto:${site.email}` },
    resumes.length > 0 && { label: 'Résumé', href: '/resume' },
    site.linkedinUrl && { label: 'LinkedIn', href: site.linkedinUrl, external: true },
    site.githubUrl && { label: 'GitHub', href: site.githubUrl, external: true },
  ].filter(Boolean) as { label: string; href: string; external?: boolean }[];

  return (
    <section id="top" aria-label="Introduction" className="relative pt-16">
      {/* --- the folio line ------------------------------------------------ */}
      <div className="ed-grid pt-6 sm:pt-10">
        <div className="flex items-baseline justify-between gap-6 pb-4">
          <span className="ed-label ed-enter">{site.host || 'Portfolio'}</span>
          <span className="ed-label ed-enter ed-enter-2 ed-mono">
            {year}
          </span>
        </div>
      </div>
      <hr className="ed-rule" />

      {/*
        The name and the standfirst share one grid.

        They used to be two stacked rows — the name, then the facts and intro
        below it. On a wide screen the name stops growing at its size cap, so it
        filled about a third of the width and the rest of the first screen was
        empty, while the intro and the "View my work" button sat below the fold:
        measured on a 1820×900 display, the button was at y=1115. Empty space
        that pushes the content off the screen is not composition.

        From 1200px up the standfirst moves into that empty column beside the
        name, bottom-aligned to it, so the first screen says who, what and where
        to click. Below 1200 the side column would be too narrow for the intro,
        so it keeps the stacked layout. See `.ed-hero` in app/editorial.css.
      */}
      <div className="ed-grid ed-hero pb-[clamp(3.5rem,7vw,6rem)] pt-[clamp(2rem,5vw,4.5rem)]">
        {/* --- the name ---------------------------------------------------- */}
        <div className="ed-hero-name">
        {site.heroGreeting && (
          <p className="ed-italic ed-enter mb-2 text-[clamp(1.25rem,2.2vw,2rem)] text-[var(--ink-60)]">
            {site.heroGreeting}
          </p>
        )}

        <h1 className="ed-masthead ed-masthead-name" aria-label={site.fullName}>
          {words.map((word, i) => (
            <Fragment key={`${word}-${i}`}>
              {/* A real space between the words. Each sits in its own block, so
                  it changes nothing on screen — but without it the text content
                  of the h1 is "KaushalBhatt.", which is what a plain-HTML reader
                  like a link-preview bot indexes. */}
              {i > 0 && ' '}
              <span className="ed-reveal-line" aria-hidden="true">
                <span style={{ animationDelay: `${0.08 + i * 0.09}s` }}>
                  {word}
                  {i === words.length - 1 && <span style={{ color: 'var(--signal)' }}>.</span>}
                </span>
              </span>
            </Fragment>
          ))}
        </h1>
        </div>

        {/* --- standfirst -------------------------------------------------- */}
        <div className="ed-hero-side">
        {/* The facts, in the apparatus face. */}
        <div className="ed-hero-facts ed-enter ed-enter-3">
          {site.headline && <p className="ed-label ed-label-ink mb-3">{site.headline}</p>}
          {site.locationLine && <p className="ed-label">{site.locationLine}</p>}
        </div>

        {/* The argument. Never shares a left edge with the name above or
            beside it — the asymmetry is the point. */}
        <div className="ed-hero-intro ed-enter ed-enter-4">
          {/*
            Markdown, as before: `**Lenskart**` stays bold without a deploy, and
            renderMarkdown escapes its input first, so this column cannot inject
            markup. The renderer's paragraph classes are overridden by `.ed-lead`.
          */}
          <div
            className="ed-lead ed-inline-md text-[var(--ink-80)]"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(site.heroIntro) }}
          />

          <div className="mt-10 flex flex-wrap gap-3">
            <a href="#experience" className="ed-btn">
              {site.primaryCtaLabel || 'View the work'}
              <span aria-hidden="true">↓</span>
            </a>
            {site.demoUrl && (
              <a
                href={site.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ed-btn ed-btn-ghost"
              >
                {site.demoLabel || 'Try the demo'}
                <span aria-hidden="true">↗</span>
              </a>
            )}
          </div>
        </div>
        </div>
      </div>

      {/* --- contact rail -------------------------------------------------- */}
      {contacts.length > 0 && (
        <>
          <hr className="ed-rule" />
          <div className="ed-grid">
            <ul className="flex flex-wrap items-center gap-x-8 gap-y-3 py-5">
              <li className="ed-label">Links</li>
              {contacts.map((c) => (
                <li key={c.label}>
                  <a
                    href={c.href}
                    className="ed-label ed-label-ink ed-link"
                    {...(c.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  >
                    {c.label}
                    {c.external && <span aria-hidden="true"> ↗</span>}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <hr className="ed-rule" />
        </>
      )}
    </section>
  );
}
