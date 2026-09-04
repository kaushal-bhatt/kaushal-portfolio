import { prisma } from '@/lib/db';
import { stringToArray } from '@/lib/sqlite-helpers';

/**
 * The open-source projects behind /portfolio.
 *
 * `siteId` first on every function — see `lib/site.ts`.
 */

export interface ProjectInput {
  title: string;
  description: string;
  technologies?: string | string[] | null;
  demoUrl?: string | null;
  githubUrl: string;
  status?: string;
  category: string;
  featured?: boolean;
  completionDate?: string;
  order?: number;
}

function fields(input: ProjectInput) {
  return {
    title: input.title,
    description: input.description,
    technologies: stringToArray(input.technologies),
    // Empty means "no demo" — stored as null so the page can hide the button
    // rather than link to an empty string.
    demoUrl: input.demoUrl?.trim() || null,
    githubUrl: input.githubUrl,
    status: input.status || 'Open Source',
    category: input.category,
    featured: input.featured || false,
    completionDate: input.completionDate || '',
    order: input.order || 0,
  };
}

export async function listProjects(siteId: string) {
  return prisma.project.findMany({ where: { siteId }, orderBy: { order: 'asc' } });
}

export async function createProject(siteId: string, input: ProjectInput) {
  return prisma.project.create({ data: { siteId, ...fields(input) } });
}

export async function updateProject(siteId: string, id: string, input: ProjectInput) {
  const { count } = await prisma.project.updateMany({ where: { id, siteId }, data: fields(input) });
  return count > 0;
}

export async function deleteProject(siteId: string, id: string) {
  const { count } = await prisma.project.deleteMany({ where: { id, siteId } });
  return count > 0;
}
