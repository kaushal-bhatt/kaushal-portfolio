'use client';

import { useEffect, useState } from 'react';
import { useSite } from '@/hooks/use-site';
import { safeTechnologies, safeAchievements } from '@/lib/safe-arrays';
import { SectionHead } from '@/components/editorial/section-head';

/**
 * Experience — the `Portfolio` table, which despite its name holds jobs.
 *
 * Set as a numbered register rather than a stack of cards. Each entry is three
 * columns: the folio, the company in the display face, and the detail. The
 * company name is large because it is the thing a recruiter scans for; the dates
 * and the role sit beside it in the apparatus face because they are the thing
 * they check second.
 *
 * The section id is `experience` now, not `portfolio` — it never held the
 * portfolio, and /portfolio is a separate page that does.
 */

type RawEntry = Omit<Entry, 'technologies' | 'achievements'> & {
  technologies: string | string[] | null;
  achievements: string | string[] | null;
};

interface Entry {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string | null;
  current: boolean;
  description: string;
  technologies: string[];
  achievements: string[];
}

export function PortfolioSection() {
  const site = useSite();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch('/api/portfolio')
      .then((r) => (r.ok ? r.json() : []))
      .then((data: RawEntry[]) =>
        setEntries(
          data.map((item) => ({
            ...item,
            technologies: safeTechnologies(item.technologies),
            achievements: safeAchievements(item.achievements),
          }))
        )
      )
      .catch((error) => console.error('Failed to fetch experience:', error))
      .finally(() => setLoaded(true));
  }, []);

  return (
    <section id="experience" aria-labelledby="experience-title" className="ed-section ed-sunk">
      <SectionHead
        number="02"
        label="Experience"
        id="experience-title"
        heading={site.experienceHeading}
        accent={site.experienceHeadingAccent}
        lead={site.experienceSubtitle}
      />

      {!loaded && <div style={{ minHeight: '60vh' }} aria-hidden="true" />}

      <ol className="pt-[clamp(3.5rem,7vw,6rem)]">
        {entries.map((job, i) => (
          <li key={job.id} className="ed-grid">
            <hr
              className={`ed-rule col-all ${i === 0 ? '' : 'ed-rule-soft'}`}
              style={i === 0 ? { borderTopColor: 'var(--ink)' } : undefined}
            />

            <div className="col-all grid gap-y-6 py-[clamp(2.25rem,4.5vw,3.75rem)] lg:grid-cols-12 lg:gap-x-[clamp(1rem,2vw,2rem)]">
              {/* folio */}
              <span className="ed-folio lg:col-span-1">{String(i + 1).padStart(2, '0')}</span>

              {/* who and when */}
              <div className="ed-rise lg:col-span-4">
                <h3 className="ed-h2">{job.company}</h3>
                <p className="ed-label ed-label-ink mt-4">{job.role}</p>
                <p className="ed-label ed-mono mt-2 flex items-center gap-2">
                  {job.startDate} — {job.current ? 'Present' : job.endDate}
                  {/* The current role gets the signal: the one place in this list
                      the accent says "here, now". */}
                  {job.current && (
                    <span className="inline-flex items-center gap-1.5" style={{ color: 'var(--signal-ink)' }}>
                      <span
                        aria-hidden="true"
                        className="inline-block h-1.5 w-1.5 rounded-full"
                        style={{ background: 'var(--signal)' }}
                      />
                      Now
                    </span>
                  )}
                </p>
              </div>

              {/* what */}
              <div className="ed-rise lg:col-span-7">
                {job.description && <p className="ed-body text-[var(--ink-80)]">{job.description}</p>}

                {job.achievements.length > 0 && (
                  <ul className="mt-6 space-y-3" style={{ maxWidth: 'var(--measure)' }}>
                    {job.achievements.map((a, k) => (
                      <li key={k} className="grid grid-cols-[1.25rem_1fr] text-[var(--ink-80)]">
                        <span aria-hidden="true" style={{ color: 'var(--signal)' }}>
                          –
                        </span>
                        <span>{a}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {job.technologies.length > 0 && (
                  <ul className="mt-8 flex flex-wrap gap-2" aria-label="Technologies">
                    {job.technologies.map((t) => (
                      <li key={t} className="ed-tag">
                        {t}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </li>
        ))}
      </ol>

      {entries.length > 0 && site.email && (
        <div className="ed-grid">
          <hr className="ed-rule col-all" />
          <div className="col-all flex flex-col items-start justify-between gap-6 pt-12 sm:flex-row sm:items-end">
            {/* The same words the old button carried, just given room. */}
            <p className="ed-h2 max-w-[18ch]">
              Let&apos;s work <em className="ed-italic">together.</em>
            </p>
            <a
              href={`mailto:${site.email}?subject=${encodeURIComponent("Let's talk")}`}
              className="ed-btn"
            >
              Get in touch <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      )}
    </section>
  );
}
