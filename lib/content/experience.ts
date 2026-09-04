import { prisma } from '@/lib/db';
import { stringToArray } from '@/lib/sqlite-helpers';

/**
 * Work experience — the `Portfolio` table, whose name means something else
 * entirely to everyone who reads it for the first time.
 *
 * Every function here takes `siteId` first. See the note in `lib/site.ts`: this
 * layer exists so that forgetting the site is a type error rather than a leak.
 */

export interface ExperienceInput {
  company: string;
  role: string;
  startDate: string;
  endDate?: string | null;
  current?: boolean;
  description: string;
  technologies?: string | string[] | null;
  achievements?: string | string[] | null;
  order?: number;
}

/** The admin form submits comma-separated text; the columns are `String[]`. */
function fields(input: ExperienceInput) {
  return {
    company: input.company,
    role: input.role,
    startDate: input.startDate,
    endDate: input.endDate || null,
    current: input.current || false,
    description: input.description,
    technologies: stringToArray(input.technologies),
    achievements: stringToArray(input.achievements),
    order: input.order || 0,
  };
}

export async function listExperience(siteId: string) {
  return prisma.portfolio.findMany({ where: { siteId }, orderBy: { order: 'asc' } });
}

export async function createExperience(siteId: string, input: ExperienceInput) {
  return prisma.portfolio.create({ data: { siteId, ...fields(input) } });
}

/**
 * `updateMany` rather than `update`, and this is the pattern every write in
 * this layer follows.
 *
 * `update({ where: { id } })` would edit a row belonging to another site if an
 * id from that site were ever posted — the id is in the URL, so the caller
 * chooses it. `updateMany` takes a filter rather than a unique key, which is
 * what lets `siteId` be part of the condition; a mismatch updates nothing and
 * reports a count of zero, which the route turns into a 404.
 */
export async function updateExperience(siteId: string, id: string, input: ExperienceInput) {
  const { count } = await prisma.portfolio.updateMany({
    where: { id, siteId },
    data: fields(input),
  });
  return count > 0;
}

export async function deleteExperience(siteId: string, id: string) {
  const { count } = await prisma.portfolio.deleteMany({ where: { id, siteId } });
  return count > 0;
}
