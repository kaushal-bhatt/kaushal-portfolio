import { prisma } from '@/lib/db';

/**
 * Shapes for the structured columns on `Resume`, and the readers that narrow
 * into them.
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

export const RESUME_ID = 'main';

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
    return {
      name,
      tagline: str(row.tagline),
      liveUrl: str(row.liveUrl) || null,
      repoUrl,
    };
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
// Reading and writing the row
// ---------------------------------------------------------------------------

/**
 * What the admin form starts from when the row does not exist yet.
 *
 * Empty rather than a sample CV: a template someone forgets to finish is worse
 * than a blank one, because it looks finished.
 */
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

/** The whole record, with the Json columns already narrowed. */
export type ResumeContent = typeof RESUME_DEFAULTS;

export async function getResume(): Promise<ResumeContent | null> {
  const row = await prisma.resume.findUnique({ where: { id: RESUME_ID } });
  if (!row) return null;

  return {
    fullName: row.fullName,
    headline: row.headline,
    location: row.location,
    email: row.email,
    phone: row.phone ?? '',
    linkedin: row.linkedin,
    github: row.github,
    website: row.website,
    summary: row.summary,
    skills: readSkills(row.skills),
    experience: readExperience(row.experience),
    projects: readProjects(row.projects),
    education: readEducation(row.education),
    certifications: row.certifications,
    languages: row.languages,
  };
}

/**
 * Turns whatever the admin form posted into a record safe to write.
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
