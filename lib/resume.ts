/**
 * Shapes for the structured columns on `Resume`.
 *
 * Prisma types a `Json` column as `Prisma.JsonValue`, which is honest — the
 * database will hold whatever was written into it, and nothing checks that a
 * hand-run UPDATE put the right shape there. So these are narrowing readers
 * rather than casts: each one drops anything that does not look like the row it
 * expects, and the page renders the rest.
 *
 * The alternative was `as ResumeExperience[]`, which turns a typo in one bullet
 * into a blank page rather than one missing line.
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
  return typeof value === 'string' ? value : '';
}

function strList(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : [];
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
