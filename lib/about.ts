import { prisma } from '@/lib/db';

/**
 * The whole About section in one read.
 *
 * The three tables are always rendered together, so splitting them across three
 * endpoints would only cost the page three round trips to show one section.
 *
 * The defaults matter: the section renders before anything has been seeded, and
 * on an empty database it should come up as an empty section rather than throw
 * on `content.subtitle`.
 */
export const ABOUT_CONTENT_ID = 'main';

export const ABOUT_CONTENT_DEFAULTS = {
  heading: 'About',
  headingAccent: 'Me',
  subtitle: '',
  journeyTitle: 'My Journey',
  journey: '',
};

export async function getAbout() {
  const [content, skills, stats] = await Promise.all([
    prisma.aboutContent.findUnique({ where: { id: ABOUT_CONTENT_ID } }),
    prisma.aboutSkill.findMany({ orderBy: { order: 'asc' } }),
    prisma.aboutStat.findMany({ orderBy: { order: 'asc' } }),
  ]);

  return {
    content: content ?? { id: ABOUT_CONTENT_ID, ...ABOUT_CONTENT_DEFAULTS },
    skills,
    stats,
  };
}
