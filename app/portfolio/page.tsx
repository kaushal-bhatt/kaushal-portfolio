'use client';

import { useEffect, useState } from 'react';
import { useSite } from '@/hooks/use-site';

/**
 * Projects — the `Project` table.
 *
 * Two treatments, on purpose. Featured work gets a spread each: a large title,
 * the argument set as a standfirst, and the links as buttons. Everything else
 * is an index — one line per project — because giving every project a card of
 * the same size is how a portfolio tells the reader nothing about which ones
 * matter.
 *
 * Every link is an anchor with an href. The previous version opened them with
 * `window.open` from a button, so they could not be middle-clicked, copied or
 * seen in the status bar before clicking.
 */

interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  demoUrl: string | null;
  githubUrl: string;
  status: string;
  category: string;
  featured: boolean;
  completionDate: string;
}

export default function PortfolioPage() {
  const site = useSite();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [category, setCategory] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/projects')
      .then((r) => (r.ok ? r.json() : []))
      .then((data: Project[]) => setProjects(data))
      .catch(() => setProjects([]))
      .finally(() => setLoaded(true));
  }, []);

  // Derived from the projects, not a fixed list — a new category gets its
  // filter the moment a project is filed under it.
  const categories = Array.from(new Set(projects.map((p) => p.category))).filter(Boolean);
  const shown = category ? projects.filter((p) => p.category === category) : projects;
  const featured = shown.filter((p) => p.featured);
  const others = shown.filter((p) => !p.featured);

  return (
    <>
      {/* --- masthead ------------------------------------------------------ */}
      <header className="pt-16">
        <div className="ed-grid pt-6 sm:pt-10">
          <div className="col-all flex items-baseline justify-between pb-4">
            <span className="ed-label ed-label-ink">
              <span style={{ color: 'var(--signal-ink)' }}>§</span>
              <span className="mx-3" aria-hidden="true">—</span>
              Projects
            </span>
            <span className="ed-label ed-mono">
              {loaded ? `${projects.length} ${projects.length === 1 ? 'project' : 'projects'}` : ' '}
            </span>
          </div>
        </div>
        <hr className="ed-rule" />

        <div className="ed-grid pb-[clamp(3rem,6vw,5rem)] pt-[clamp(2.5rem,6vw,5rem)]">
          <h1 className="ed-masthead col-all ed-enter">
            {site.projectsHeading}
            {site.projectsHeading && site.projectsHeadingAccent && ' '}
            {site.projectsHeadingAccent && <em className="ed-italic">{site.projectsHeadingAccent}</em>}
          </h1>
          {site.projectsSubtitle && (
            <p className="ed-lead col-5-12 ed-enter ed-enter-2 mt-10 text-[var(--ink-60)]">
              {site.projectsSubtitle}
            </p>
          )}
        </div>
      </header>

      {!loaded && <div style={{ minHeight: '60vh' }} aria-hidden="true" />}

      {loaded && projects.length === 0 && (
        <div className="ed-grid pb-[clamp(5rem,10vw,9rem)]">
          <hr className="ed-rule col-all" style={{ borderTopColor: 'var(--ink)' }} />
          <p className="ed-lead col-all py-16 text-[var(--ink-60)]">Projects will be listed here.</p>
        </div>
      )}

      {/* --- filter -------------------------------------------------------- */}
      {categories.length > 1 && (
        <div className="ed-grid pb-[clamp(2.5rem,5vw,4rem)]">
          <div className="col-all">
            <span className="ed-label mb-3 block">Category</span>
            <ul className="flex flex-wrap gap-2" aria-label="Filter by category">
              <li>
                <button
                  type="button"
                  className="ed-tag"
                  aria-pressed={category === null}
                  onClick={() => setCategory(null)}
                >
                  All
                </button>
              </li>
              {categories.map((c) => (
                <li key={c}>
                  <button
                    type="button"
                    className="ed-tag"
                    aria-pressed={category === c}
                    onClick={() => setCategory(category === c ? null : c)}
                  >
                    {c}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* --- features ------------------------------------------------------ */}
      {featured.map((project, i) => (
        <section key={project.id} aria-labelledby={`p-${project.id}`} className={i % 2 ? 'ed-sunk' : ''}>
          <hr className="ed-rule" style={i === 0 ? { borderTopColor: 'var(--ink)' } : undefined} />
          <div className="ed-grid py-[clamp(3.5rem,8vw,7rem)]">
            <div className="col-all mb-8 flex flex-wrap items-baseline justify-between gap-4">
              <span className="ed-folio">{String(i + 1).padStart(2, '0')} / Featured</span>
              <span className="ed-label ed-mono">
                {[project.category, project.status, project.completionDate].filter(Boolean).join(' · ')}
              </span>
            </div>

            <h2 id={`p-${project.id}`} className="ed-display col-1-9 ed-rise">
              {project.title}
            </h2>

            <div className="col-4-12 ed-rise mt-10">
              <p className="ed-lead text-[var(--ink-80)]">{project.description}</p>

              {project.technologies.length > 0 && (
                <ul className="mt-8 flex flex-wrap gap-2" aria-label="Technologies">
                  {project.technologies.map((t) => (
                    <li key={t} className="ed-tag">
                      {t}
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-10 flex flex-wrap gap-3">
                {project.demoUrl && (
                  <a href={project.demoUrl} target="_blank" rel="noopener noreferrer" className="ed-btn">
                    Live <span aria-hidden="true">↗</span>
                  </a>
                )}
                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ed-btn ed-btn-ghost"
                  >
                    Source <span aria-hidden="true">↗</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* --- index --------------------------------------------------------- */}
      {others.length > 0 && (
        <section aria-labelledby="more-projects" className="pt-[clamp(3.5rem,7vw,6rem)]">
          <div className="ed-grid">
            <h2 id="more-projects" className="ed-label col-all mb-6">
              {featured.length > 0 ? 'Also built' : 'Index'}
            </h2>
          </div>
          <ul className="ed-grid">
            {others.map((project, i) => (
              <li
                key={project.id}
                className="col-all grid gap-y-3 py-7 lg:grid-cols-12 lg:gap-x-[clamp(1rem,2vw,2rem)]"
                style={{ borderTop: i === 0 ? '1px solid var(--ink)' : '1px solid var(--rule)' }}
              >
                <div className="lg:col-span-6">
                  <h3 className="ed-h2 text-[clamp(1.4rem,2.2vw,2rem)]">{project.title}</h3>
                  <p className="mt-3 max-w-[60ch] text-[var(--ink-60)]">{project.description}</p>
                </div>
                <p className="ed-label ed-mono lg:col-span-3">
                  {[project.category, project.completionDate].filter(Boolean).join(' · ')}
                </p>
                <div className="flex flex-wrap items-start gap-x-6 gap-y-2 lg:col-span-3 lg:justify-end">
                  {project.demoUrl && (
                    <a
                      href={project.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ed-label ed-label-ink ed-link"
                    >
                      Live ↗
                    </a>
                  )}
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ed-label ed-label-ink ed-link"
                    >
                      Source ↗
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* --- contact ------------------------------------------------------- */}
      {loaded && (site.contactHeading || site.email) && (
        <div className="ed-grid pb-[clamp(5rem,10vw,9rem)] pt-[clamp(4.5rem,9vw,8rem)]">
          <hr className="ed-rule col-all mb-12" />
          <div className="col-1-7">
            {site.contactHeading && <h2 className="ed-h2">{site.contactHeading}</h2>}
            {site.contactSubtitle && (
              <p className="ed-lead mt-6 text-[var(--ink-60)]">{site.contactSubtitle}</p>
            )}
          </div>
          {site.email && (
            <div className="col-8-12 mt-8 flex items-end lg:mt-0 lg:justify-end">
              <a href={`mailto:${site.email}`} className="ed-btn">
                Get in touch <span aria-hidden="true">→</span>
              </a>
            </div>
          )}
        </div>
      )}
    </>
  );
}
