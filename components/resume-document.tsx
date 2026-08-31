import { displayUrl, type ResumeContent } from '@/lib/resume';

/**
 * The résumé, as an A4 sheet.
 *
 * A server component on purpose. Everything else on this site fetches from
 * /api in an effect, which is fine for a section that fades in — but this page
 * exists to be printed, and a print fired against a half-mounted client
 * component produces a blank page. Rendering it on the server means the
 * document is complete before the browser has a chance to print it.
 *
 * Single column, no tables, no icons in the text: an ATS extracts a
 * multi-column PDF in reading order, which is to say the wrong order, and
 * silently. The styling here is all vertical rhythm and type weight, which
 * costs nothing on the way through a parser.
 */
export function ResumeDocument({ resume }: { resume: ResumeContent }) {
  const { skills, experience, projects, education } = resume;

  return (
    <article className="resume-sheet mx-auto w-full max-w-[210mm] bg-white text-slate-800 shadow-2xl print:shadow-none">
      <div className="px-8 py-10 sm:px-12 sm:py-12 print:p-0">
        {/* ---------------------------------------------------------------
            Header
        --------------------------------------------------------------- */}
        <header className="border-b-2 border-slate-800 pb-4">
          <h1 className="text-[26px] font-bold leading-none tracking-tight text-slate-900">
            {resume.fullName}
          </h1>
          <p className="mt-1.5 text-[12px] font-medium text-slate-600">{resume.headline}</p>

          <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[10.5px] text-slate-600">
            <span>{resume.location}</span>
            <Dot />
            <a href={`mailto:${resume.email}`} className="hover:text-blue-700">
              {resume.email}
            </a>
            {/*
              Print only. This page is public and a phone number on a public page
              is a scraper target; the PDF a recruiter downloads carries it.
            */}
            {resume.phone && (
              <>
                <span className="print-only">
                  <Dot />
                </span>
                <span className="print-only">{resume.phone}</span>
              </>
            )}
            <Dot />
            <a href={`https://${displayUrl(resume.linkedin)}`} className="hover:text-blue-700">
              {displayUrl(resume.linkedin)}
            </a>
            <Dot />
            <a href={`https://${displayUrl(resume.github)}`} className="hover:text-blue-700">
              {displayUrl(resume.github)}
            </a>
            <Dot />
            <a href={`https://${displayUrl(resume.website)}`} className="hover:text-blue-700">
              {displayUrl(resume.website)}
            </a>
          </div>
        </header>

        {/* ---------------------------------------------------------------
            Summary
        --------------------------------------------------------------- */}
        <Section title="Professional Summary">
          <p className="text-[12px] leading-[1.55] text-slate-700">{resume.summary}</p>
        </Section>

        {/* ---------------------------------------------------------------
            Experience
        --------------------------------------------------------------- */}
        <Section title="Professional Experience">
          <div className="space-y-4">
            {experience.map((job) => (
              <div key={`${job.company}-${job.period}`} className="resume-avoid-break">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                  <h3 className="text-[12.5px] font-bold text-slate-900">
                    {job.role}
                    <span className="font-semibold text-slate-700"> — {job.company}</span>
                  </h3>
                  <span className="text-[10.5px] font-medium text-slate-500">
                    {job.period}
                    {job.location ? ` · ${job.location}` : ''}
                  </span>
                </div>

                {job.context && (
                  <p className="mt-0.5 text-[10.5px] italic text-slate-500">{job.context}</p>
                )}

                <ul className="mt-1.5 space-y-1">
                  {job.bullets.map((bullet) => (
                    <li
                      key={bullet}
                      className="relative pl-3.5 text-[11.5px] leading-[1.5] text-slate-700"
                    >
                      <span className="absolute left-0 top-0 text-slate-400">–</span>
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Section>

        {/* ---------------------------------------------------------------
            Skills
        --------------------------------------------------------------- */}
        <Section title="Technical Skills">
          <dl className="space-y-1">
            {skills.map((group) => (
              <div key={group.label} className="flex flex-wrap gap-x-1.5 text-[11.5px] leading-[1.5]">
                <dt className="font-semibold text-slate-900">{group.label}:</dt>
                <dd className="flex-1 text-slate-700">{group.items}</dd>
              </div>
            ))}
          </dl>
        </Section>

        {/* ---------------------------------------------------------------
            Projects — every one of these is running somewhere clickable,
            which is the only reason to put projects on a CV at all.
        --------------------------------------------------------------- */}
        <Section title="Projects">
          <div className="space-y-2.5">
            {projects.map((project) => (
              <div key={project.name} className="resume-avoid-break">
                <div className="flex flex-wrap items-baseline gap-x-2">
                  <h3 className="text-[11.5px] font-bold text-slate-900">{project.name}</h3>
                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      className="text-[10.5px] text-blue-700 hover:underline"
                    >
                      {displayUrl(project.liveUrl)}
                    </a>
                  )}
                  <span className="text-[10.5px] text-slate-300">|</span>
                  <a href={project.repoUrl} className="text-[10.5px] text-blue-700 hover:underline">
                    {displayUrl(project.repoUrl)}
                  </a>
                </div>
                <p className="mt-0.5 text-[11.5px] leading-[1.5] text-slate-700">
                  {project.tagline}
                </p>
              </div>
            ))}
          </div>
        </Section>

        {/* ---------------------------------------------------------------
            Education, certifications, languages
        --------------------------------------------------------------- */}
        <Section title="Education">
          {education.map((entry) => (
            <div
              key={entry.degree}
              className="flex flex-wrap items-baseline justify-between gap-x-3 text-[11.5px]"
            >
              <span>
                <span className="font-semibold text-slate-900">{entry.degree}</span>
                <span className="text-slate-700">
                  {' '}
                  — {entry.institution}
                  {entry.location ? `, ${entry.location}` : ''}
                </span>
              </span>
              <span className="text-[10.5px] font-medium text-slate-500">{entry.period}</span>
            </div>
          ))}
        </Section>

        <Section title="Certifications & Training">
          <p className="text-[11.5px] leading-[1.5] text-slate-700">{resume.certifications}</p>
        </Section>

        <Section title="Languages">
          <p className="text-[11.5px] leading-[1.5] text-slate-700">{resume.languages}</p>
        </Section>
      </div>
    </article>
  );
}

function Dot() {
  return <span className="text-slate-300">·</span>;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-5">
      <h2 className="mb-2 border-b border-slate-200 pb-1 text-[9.5px] font-bold uppercase tracking-[0.18em] text-slate-900">
        {title}
      </h2>
      {children}
    </section>
  );
}
