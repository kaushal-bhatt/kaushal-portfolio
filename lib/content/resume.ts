import { cache } from 'react';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import {
  readEducation,
  readExperience,
  readProjects,
  readSkills,
  type ResumeContent,
  type ResumeLink,
  type ResumeMeta,
  type ResumeRecord,
} from '@/lib/resume-content';

/**
 * The résumés behind /resume.
 *
 * The document's shape, its readers and its validation are in
 * `lib/resume-content.ts` — the admin editor is a client component and imports
 * them. This half reads and writes, and takes `siteId` first; see `lib/site.ts`.
 */

type ResumeRow = {
  id: string;
  slug: string;
  label: string;
  published: boolean;
  order: number;
  updatedAt: Date;
  fullName: string;
  headline: string;
  location: string;
  email: string;
  phone: string | null;
  linkedin: string;
  github: string;
  website: string;
  summary: string;
  skills: unknown;
  experience: unknown;
  projects: unknown;
  education: unknown;
  certifications: string;
  languages: string;
};

function toRecord(row: ResumeRow): ResumeRecord {
  return {
    id: row.id,
    slug: row.slug,
    label: row.label,
    published: row.published,
    order: row.order,
    updatedAt: row.updatedAt.toISOString(),
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
 * Two keys, because `order` alone leaves ties undecided and the résumé that
 * `/resume` redirects to must not depend on which row Postgres happens to
 * return first.
 */
const RESUME_ORDER = [{ order: 'asc' as const }, { updatedAt: 'desc' as const }];

/** Every link surface on the public site reads this, and hides itself when it is empty. */
export async function getPublishedResumeLinks(siteId: string): Promise<ResumeLink[]> {
  return prisma.resume.findMany({
    where: { siteId, published: true },
    orderBy: RESUME_ORDER,
    select: { slug: true, label: true },
  });
}

/**
 * Unpublished résumés are absent, not forbidden — 404, never 403. A 403 would
 * confirm that a draft exists at that address, which is the same reasoning the
 * blog's unpublished posts follow. A résumé belonging to the other site is
 * absent for the same reason and by the same mechanism: it is simply not in the
 * result.
 *
 * Memoised per request, like the blog's reads: `generateMetadata` and the page
 * body both want the same document, and this route was running the query twice
 * on every view.
 */
export const getPublishedResume = cache(
  async (siteId: string, slug: string): Promise<ResumeRecord | null> => {
    const row = await prisma.resume.findFirst({ where: { siteId, slug, published: true } });
    return row ? toRecord(row) : null;
  }
);

/** Where a bare /resume goes. */
export async function getPrimaryPublishedSlug(siteId: string): Promise<string | null> {
  const row = await prisma.resume.findFirst({
    where: { siteId, published: true },
    orderBy: RESUME_ORDER,
    select: { slug: true },
  });
  return row?.slug ?? null;
}

export async function listResumes(siteId: string): Promise<ResumeMeta[]> {
  const list = await prisma.resume.findMany({
    where: { siteId },
    orderBy: RESUME_ORDER,
    select: { id: true, slug: true, label: true, published: true, order: true, updatedAt: true },
  });
  return list.map((row) => ({ ...row, updatedAt: row.updatedAt.toISOString() }));
}

export async function getResumeById(siteId: string, id: string): Promise<ResumeRecord | null> {
  const row = await prisma.resume.findFirst({ where: { id, siteId } });
  return row ? toRecord(row) : null;
}

/**
 * A slug nothing else on this site is using, suffixed with -2, -3 … until it is
 * free.
 *
 * The uniqueness is per site, so both portfolios may have a
 * /resume/senior-backend-engineer. Without this a second résumé labelled the
 * same way fails the insert with a constraint error the admin panel can only
 * report as "something went wrong". `excludeId` is the row being renamed, which
 * must not collide with itself.
 *
 * There is a race here — two creates in the same millisecond can both find the
 * same slug free. The unique index still refuses the second, which is the
 * correct outcome, and one person edits this.
 */
export async function uniqueResumeSlug(
  siteId: string,
  base: string,
  excludeId?: string
): Promise<string> {
  const root = base || 'resume';
  const taken = await prisma.resume.findMany({
    where: { siteId, slug: { startsWith: root }, ...(excludeId ? { NOT: { id: excludeId } } : {}) },
    select: { slug: true },
  });
  const used = new Set(taken.map((row) => row.slug));

  if (!used.has(root)) return root;
  for (let n = 2; ; n += 1) {
    const candidate = `${root}-${n}`;
    if (!used.has(candidate)) return candidate;
  }
}

/**
 * The document, shaped for a write.
 *
 * The four structured sections are `Json` columns, so Prisma types them as
 * `InputJsonValue` and the narrowed arrays have to be cast on the way in. Doing
 * it here rather than at each call site means the cast appears once.
 */
function documentFields(content: ResumeContent) {
  const { skills, experience, projects, education, phone, ...scalars } = content;
  return {
    ...scalars,
    // The column is nullable and the form sends "". Storing null keeps "no
    // phone number" as one value rather than two.
    phone: phone || null,
    skills: skills as unknown as Prisma.InputJsonValue,
    experience: experience as unknown as Prisma.InputJsonValue,
    projects: projects as unknown as Prisma.InputJsonValue,
    education: education as unknown as Prisma.InputJsonValue,
  };
}

export async function createResume(
  siteId: string,
  fields: { slug: string; label: string; content: ResumeContent }
) {
  return prisma.resume.create({
    data: {
      siteId,
      slug: fields.slug,
      label: fields.label,
      published: false,
      // Behind everything that exists on this site, so creating one never
      // changes which résumé /resume redirects to.
      order: (await prisma.resume.count({ where: { siteId } })) + 1,
      ...documentFields(fields.content),
    },
    select: { id: true },
  });
}

export async function updateResume(
  siteId: string,
  id: string,
  fields: { slug: string; label: string; published: boolean; order: number; content: ResumeContent }
) {
  const { count } = await prisma.resume.updateMany({
    where: { id, siteId },
    data: {
      ...documentFields(fields.content),
      label: fields.label,
      slug: fields.slug,
      published: fields.published,
      order: fields.order,
    },
  });
  return count > 0;
}

/** The publish toggle and the sort key, without touching the document. */
export async function patchResume(
  siteId: string,
  id: string,
  data: { published?: boolean; order?: number }
) {
  const { count } = await prisma.resume.updateMany({ where: { id, siteId }, data });
  if (count === 0) return null;
  return prisma.resume.findFirst({
    where: { id, siteId },
    select: { id: true, published: true, order: true },
  });
}

export async function deleteResume(siteId: string, id: string) {
  const { count } = await prisma.resume.deleteMany({ where: { id, siteId } });
  return count > 0;
}
