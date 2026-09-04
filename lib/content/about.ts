import { prisma } from '@/lib/db';
import { stringToArray } from '@/lib/sqlite-helpers';

/**
 * The About section — prose, skill cards and the figures beneath them.
 *
 * The three tables are always rendered together, so splitting them across three
 * endpoints would only cost the page three round trips to show one section.
 *
 * The defaults matter: the section renders before anything has been seeded, and
 * on an empty database it should come up as an empty section rather than throw
 * on `content.subtitle`.
 *
 * `siteId` first on every function — see `lib/site.ts`. The prose used to be a
 * singleton keyed on the literal id "main", which is the same row for everyone;
 * it is one row *per site* now, and `ABOUT_CONTENT_ID` went with the change.
 */

export const ABOUT_CONTENT_DEFAULTS = {
  heading: 'About',
  headingAccent: 'Me',
  subtitle: '',
  journeyTitle: 'My Journey',
  journey: '',
};

export async function getAbout(siteId: string) {
  const [content, skills, stats] = await Promise.all([
    prisma.aboutContent.findUnique({ where: { siteId } }),
    prisma.aboutSkill.findMany({ where: { siteId }, orderBy: { order: 'asc' } }),
    prisma.aboutStat.findMany({ where: { siteId }, orderBy: { order: 'asc' } }),
  ]);

  return {
    content: content ?? { ...ABOUT_CONTENT_DEFAULTS },
    skills,
    stats,
  };
}

/** The empty section a request with no site at all renders. */
export function emptyAbout() {
  return { content: { ...ABOUT_CONTENT_DEFAULTS }, skills: [], stats: [] };
}

export interface AboutContentInput {
  heading?: string;
  headingAccent?: string;
  subtitle: string;
  journeyTitle?: string;
  journey: string;
}

/**
 * The prose block. An upsert rather than a create/update pair: there is exactly
 * one row per site and it may not exist yet, so a PUT has to be able to make
 * it. Upserting on `siteId` is what keeps that "one row" claim true now that
 * more than one site exists — the fixed id it used to upsert on was shared.
 */
export async function saveAboutContent(siteId: string, input: AboutContentInput) {
  const fields = {
    heading: input.heading?.trim() || ABOUT_CONTENT_DEFAULTS.heading,
    headingAccent: input.headingAccent?.trim() || ABOUT_CONTENT_DEFAULTS.headingAccent,
    subtitle: input.subtitle,
    journeyTitle: input.journeyTitle?.trim() || ABOUT_CONTENT_DEFAULTS.journeyTitle,
    journey: input.journey,
  };

  return prisma.aboutContent.upsert({
    where: { siteId },
    update: fields,
    create: { siteId, ...fields },
  });
}

// ---------------------------------------------------------------------------
// Skill cards
// ---------------------------------------------------------------------------

export interface SkillInput {
  category: string;
  icon?: string;
  items?: string | string[] | null;
  color?: string;
  order?: number;
}

function skillFields(input: SkillInput) {
  return {
    category: input.category.trim(),
    icon: input.icon || 'Code2',
    // The form submits comma-separated text; the column is String[].
    items: stringToArray(input.items),
    color: input.color || 'blue',
    order: input.order || 0,
  };
}

export async function createSkill(siteId: string, input: SkillInput) {
  return prisma.aboutSkill.create({ data: { siteId, ...skillFields(input) } });
}

export async function updateSkill(siteId: string, id: string, input: SkillInput) {
  const { count } = await prisma.aboutSkill.updateMany({
    where: { id, siteId },
    data: skillFields(input),
  });
  return count > 0;
}

export async function deleteSkill(siteId: string, id: string) {
  const { count } = await prisma.aboutSkill.deleteMany({ where: { id, siteId } });
  return count > 0;
}

// ---------------------------------------------------------------------------
// The figures
// ---------------------------------------------------------------------------

export interface StatInput {
  label: string;
  description: string;
  icon?: string;
  order?: number;
}

function statFields(input: StatInput) {
  return {
    label: input.label.trim(),
    description: input.description.trim(),
    icon: input.icon || 'Award',
    order: input.order || 0,
  };
}

export async function createStat(siteId: string, input: StatInput) {
  return prisma.aboutStat.create({ data: { siteId, ...statFields(input) } });
}

export async function updateStat(siteId: string, id: string, input: StatInput) {
  const { count } = await prisma.aboutStat.updateMany({
    where: { id, siteId },
    data: statFields(input),
  });
  return count > 0;
}

export async function deleteStat(siteId: string, id: string) {
  const { count } = await prisma.aboutStat.deleteMany({ where: { id, siteId } });
  return count > 0;
}
