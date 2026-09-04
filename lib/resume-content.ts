
/**
 * Shapes for the structured columns on `Resume`, and the readers that narrow
 * into them.
 *
 * The reads and writes themselves live in `lib/content/resume.ts`, which takes
 * a `siteId`. This half is split out because `app/admin/resume/[id]/page.tsx`
 * is a client component and imports these types and validators — the same split
 * `lib/site-content.ts` exists for, and for the same reason: importing a module
 * that touches Prisma from a client graph is a build error waiting for the
 * bundler to stop tree-shaking it away.
 *
 * Prisma types a `Json` column as `Prisma.JsonValue`, which is honest — the
 * database will hold whatever was written into it, and nothing checks that a
 * hand-run UPDATE put the right shape there. So these are narrowing readers
 * rather than casts: each one drops anything that does not look like the row it
 * expects, and the page renders the rest.
 *
 * The same readers run on the way *in*, over the admin form's payload. Both
 * directions are boundaries with untyped data on the far side, and one set of
 * rules for both means the editor cannot save a shape the page then refuses to
 * render. They trim, and drop rows that came out empty, so a blank line left in
 * a textarea does not become a bullet point.
 */

export interface ResumeSkillGroup {
  label: string;
  items: string;
}

export interface ResumeExperience {
  company: string;
  role: string;
  period: string;
  location: string;
  /** Optional one-line framing under the role — the stack, or what the product is. */
  context?: string;
  bullets: string[];
}

export interface ResumeProject {
  name: string;
  tagline: string;
  liveUrl?: string | null;
  repoUrl: string;
}

export interface ResumeEducation {
  degree: string;
  institution: string;
  location: string;
  period: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function str(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function strList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map(str).filter(Boolean);
}

/** Maps over a Json column that should hold an array of objects, dropping the rest. */
function rows<T>(value: unknown, read: (row: Record<string, unknown>) => T | null): T[] {
  if (!Array.isArray(value)) return [];
  return value.filter(isRecord).map(read).filter((row): row is T => row !== null);
}

export function readSkills(value: unknown): ResumeSkillGroup[] {
  return rows(value, (row) => {
    const label = str(row.label);
    const items = str(row.items);
    return label && items ? { label, items } : null;
  });
}

export function readExperience(value: unknown): ResumeExperience[] {
  return rows(value, (row) => {
    const company = str(row.company);
    if (!company) return null;
    return {
      company,
      role: str(row.role),
      period: str(row.period),
      location: str(row.location),
      context: str(row.context) || undefined,
      bullets: strList(row.bullets),
    };
  });
}

export function readProjects(value: unknown): ResumeProject[] {
  return rows(value, (row) => {
    const name = str(row.name);
    const repoUrl = str(row.repoUrl);
    if (!name || !repoUrl) return null;
    return { name, tagline: str(row.tagline), liveUrl: str(row.liveUrl) || null, repoUrl };
  });
}

export function readEducation(value: unknown): ResumeEducation[] {
  return rows(value, (row) => {
    const degree = str(row.degree);
    if (!degree) return null;
    return {
      degree,
      institution: str(row.institution),
      location: str(row.location),
      period: str(row.period),
    };
  });
}

/**
 * Strips the scheme from a URL for display.
 *
 * A CV that prints `https://github.com/...` wastes eight characters of a line
 * that is already tight, and reads like a link rather than an address. The href
 * keeps the full URL.
 */
export function displayUrl(url: string): string {
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
}

// ---------------------------------------------------------------------------
// The record
// ---------------------------------------------------------------------------

/** The document itself, without the columns that decide where it lives. */
export const RESUME_DEFAULTS = {
  fullName: '',
  headline: '',
  location: '',
  email: '',
  phone: '',
  linkedin: '',
  github: '',
  website: '',
  summary: '',
  skills: [] as ResumeSkillGroup[],
  experience: [] as ResumeExperience[],
  projects: [] as ResumeProject[],
  education: [] as ResumeEducation[],
  certifications: '',
  languages: '',
};

export type ResumeContent = typeof RESUME_DEFAULTS;

const RESUME_CONTENT_KEYS = Object.keys(RESUME_DEFAULTS) as (keyof ResumeContent)[];

/**
 * The document out of a full record, without `id`, `slug`, `published` and the
 * rest — the columns that say where a résumé lives rather than what it says.
 *
 * Keyed off the defaults rather than destructured at the call site, so adding a
 * field to the document means adding it in one place. A destructure that
 * discards five names is also five unused variables, which is a lint error and
 * a fair one: it reads as a mistake.
 */
export function resumeContentOf(source: Partial<ResumeContent>): ResumeContent {
  const content = { ...RESUME_DEFAULTS };
  for (const key of RESUME_CONTENT_KEYS) {
    const value = source[key];
    if (value !== undefined) (content as Record<string, unknown>)[key] = value;
  }
  return content;
}

/** What the admin list and the public link surfaces need, without the body. */
export interface ResumeMeta {
  id: string;
  slug: string;
  label: string;
  published: boolean;
  order: number;
  updatedAt: string;
}

export type ResumeRecord = ResumeMeta & ResumeContent;

/** Just enough to render a link. */
export type ResumeLink = Pick<ResumeMeta, 'slug' | 'label'>;

// ---------------------------------------------------------------------------
// Writing
// ---------------------------------------------------------------------------

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}
/**
 * Turns whatever the admin form posted into a body safe to write.
 *
 * Returns the reason instead when a required field is missing. The four
 * required ones are the four the page cannot render around: a résumé with no
 * name is not a résumé, and a blank summary leaves a labelled empty box at the
 * top of the document. Everything else may legitimately be empty — there is no
 * rule that a CV must list certifications.
 */
export function normaliseResumeInput(
  input: unknown
): { ok: true; value: ResumeContent } | { ok: false; error: string } {
  if (!isRecord(input)) return { ok: false, error: 'Expected an object' };

  const value: ResumeContent = {
    fullName: str(input.fullName),
    headline: str(input.headline),
    location: str(input.location),
    email: str(input.email),
    phone: str(input.phone),
    linkedin: str(input.linkedin),
    github: str(input.github),
    website: str(input.website),
    summary: str(input.summary),
    skills: readSkills(input.skills),
    experience: readExperience(input.experience),
    projects: readProjects(input.projects),
    education: readEducation(input.education),
    certifications: str(input.certifications),
    languages: str(input.languages),
  };

  const missing = (['fullName', 'headline', 'email', 'summary'] as const).filter(
    (field) => !value[field]
  );
  if (missing.length > 0) {
    return { ok: false, error: `Required: ${missing.join(', ')}` };
  }

  return { ok: true, value };
}

/**
 * The filename the browser suggests when the PDF is saved.
 *
 * Browsers name it after `document.title`, so the print button swaps the title
 * before opening the dialog. Underscores rather than spaces, because this ends
 * up in a recruiter's downloads folder next to fifty other files.
 */
export function pdfFilename(record: Pick<ResumeRecord, 'fullName' | 'label'>): string {
  const parts = [record.fullName, record.label]
    .map((part) => part.replace(/[^A-Za-z0-9]+/g, '_').replace(/^_+|_+$/g, ''))
    .filter(Boolean);
  return parts.join('_') || 'Resume';
}
