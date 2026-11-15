'use client';

import { useEffect, useState } from 'react';
import { renderMarkdown } from '@/lib/markdown';
import { usePublishedResumes } from '@/hooks/use-published-resumes';
import { SectionHead } from '@/components/editorial/section-head';

/**
 * About — the argument, the figures, the stack, and the résumé.
 *
 * All of it still arrives from /api/about and is edited in /admin/about. The
 * rows carry `icon` and `color` keys from the previous design; this one does
 * not render icons, so those fields are simply unread here. They are left in
 * the schema rather than migrated away, which keeps the redesign reversible.
 */

interface AboutContent {
  heading: string;
  headingAccent: string;
  subtitle: string;
  journeyTitle: string;
  journey: string;
}

interface AboutSkill {
  id: string;
  category: string;
  items: string[];
}

interface AboutStat {
  id: string;
  label: string;
  description: string;
}

export function AboutSection() {
  const [content, setContent] = useState<AboutContent | null>(null);
  const [skills, setSkills] = useState<AboutSkill[]>([]);
  const [stats, setStats] = useState<AboutStat[]>([]);
  const [loaded, setLoaded] = useState(false);

  const resumes = usePublishedResumes();

  useEffect(() => {
    // One request: the three parts always render together.
    fetch('/api/about')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return;
        setContent(data.content);
        setSkills(data.skills ?? []);
        setStats(data.stats ?? []);
      })
      .catch((error) => console.error('Failed to fetch about data:', error))
      .finally(() => setLoaded(true));
  }, []);

  return (
    <section id="about" aria-labelledby="about-title" className="ed-section">
      <SectionHead
        number="01"
        label="About"
        id="about-title"
        heading={content?.heading}
        accent={content?.headingAccent}
        lead={content?.subtitle}
      />

      {/* Reserve the space while loading, so the page below does not jump up
          and then back down when the copy arrives. */}
      {!loaded && <div style={{ minHeight: '60vh' }} aria-hidden="true" />}

      {/* --- the story ---------------------------------------------------- */}
      {content?.journey && (
        <div className="ed-grid pt-[clamp(3.5rem,7vw,6.5rem)]">
          {/* The title hangs in its own narrow column and stays put while the
              prose beside it scrolls — the marginal-heading layout of a long
              magazine feature. */}
          <div className="col-1-5 mb-6 lg:mb-0">
            <div className="lg:sticky lg:top-28">
              <p className="ed-label mb-3">{content.journeyTitle}</p>
              <span className="block h-px w-12" style={{ background: 'var(--signal)' }} />
            </div>
          </div>

          <div
            className="col-6-12 ed-prose ed-rise"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(content.journey) }}
          />
        </div>
      )}

      {/* --- the figures ---------------------------------------------------
          Numerals first and large; the words under them are captions. Hairline
          dividers between rather than a box round each — four boxes in a row is
          the bento grid this redesign is moving away from. */}
      {stats.length > 0 && (
        <div className="ed-sunk mt-[clamp(4.5rem,9vw,8rem)]">
          <hr className="ed-rule" />
          <div className="ed-grid">
            <dl className="grid grid-cols-2 lg:grid-cols-4">
              {stats.map((stat, i) => (
                <div
                  key={stat.id}
                  className="ed-rise py-10 pr-6 lg:py-14"
                  style={{
                    borderLeft: i % 4 === 0 ? undefined : '1px solid var(--rule)',
                    paddingLeft: i % 4 === 0 ? 0 : 'clamp(1rem, 2vw, 2rem)',
                    animationDelay: `${i * 0.06}s`,
                  }}
                >
                  <dt className="ed-numeral">{stat.label}</dt>
                  <dd className="ed-label ed-label-ink mt-4 max-w-[22ch] leading-relaxed">
                    {stat.description}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
          <hr className="ed-rule" />
        </div>
      )}

      {/* --- the stack -----------------------------------------------------
          A typeset index rather than a card grid: the category in the display
          face down the left, the items as one running line on the right, a rule
          between rows. It reads in the time a card grid takes to scan. */}
      {skills.length > 0 && (
        <div className="ed-grid pt-[clamp(4.5rem,9vw,8rem)]">
          <p className="ed-label col-1-5 mb-8 lg:mb-0">Stack</p>
          <dl className="col-6-12">
            {skills.map((skill, i) => (
              <div
                key={skill.id}
                className="ed-rise grid gap-2 py-5 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] sm:gap-8"
                style={{ borderTop: i === 0 ? '1px solid var(--ink)' : '1px solid var(--rule)' }}
              >
                <dt className="ed-h3" style={{ fontFamily: 'var(--font-display)', fontWeight: 400 }}>
                  {skill.category}
                </dt>
                <dd className="text-[var(--ink-60)]">{skill.items.join(', ')}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {/* --- the résumé ----------------------------------------------------
          Still the loudest thing in the section, for the same reason as before:
          a recruiter on an engineer's site is usually looking for exactly one
          artefact. Inverted — ink ground, paper type — so it is the one block on
          the page that reads as a call to action without needing a colour. */}
      {resumes.length > 0 && (
        <div className="ed-grid pt-[clamp(4.5rem,9vw,8rem)]">
          <div
            className="col-all ed-rise grid gap-8 p-[clamp(1.75rem,4vw,3.5rem)] lg:grid-cols-12"
            style={{ background: 'var(--paper-ink)', color: 'var(--paper)' }}
          >
            <div className="lg:col-span-7">
              <p className="ed-label mb-5" style={{ color: 'oklch(97% 0.01 85 / 0.55)' }}>
                The document
              </p>
              <h3 className="ed-display" style={{ color: 'var(--paper)' }}>
                Résumé<span style={{ color: 'var(--signal)' }}>.</span>
              </h3>
            </div>
            <div className="flex flex-col justify-end gap-6 lg:col-span-5">
              <p className="max-w-[46ch]" style={{ color: 'oklch(97% 0.01 85 / 0.72)' }}>
                Roles, the stack, and links to everything running live — rendered from the
                same database as this page, so it is never out of date. Saves as a PDF from
                the browser.
              </p>
              <div className="flex flex-wrap gap-3">
                {resumes.map((resume) => (
                  <a
                    key={resume.slug}
                    href={`/resume/${resume.slug}`}
                    className="ed-btn ed-btn-paper"
                  >
                    {/* The label once there is more than one: two buttons both
                        saying "Open résumé" would look identical and not be. */}
                    {resumes.length > 1 ? resume.label : 'Open résumé'}
                    <span aria-hidden="true">→</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
