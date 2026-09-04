import { cache } from 'react';
import { prisma } from '@/lib/db';
import { DEFAULT_TECH_COLOR, DEFAULT_TECH_ICON, topicSlug } from '@/lib/tech-visuals';

/**
 * Blog topics — the `TechSection` table.
 *
 * The reason this file exists: the post editor's topic field used to be a
 * dropdown over whatever rows happened to be in that table, and there was no
 * admin UI for the table. So writing about anything outside Java, Spring Boot,
 * PostgreSQL and Kafka required a code change and a deploy. Worse, on an empty
 * table the dropdown was empty and no post could be created at all.
 *
 * Now the field is free text and an unrecognised topic creates its row. The
 * cost of that is topics accumulating typos — which is what `/admin/topics` is
 * for.
 *
 * `siteId` first on every function — see `lib/site.ts`. Two sites writing about
 * Java have two topics called Java, which is why the uniques on this table are
 * composite: the slug `java` is not a global name, it is a name inside a site.
 */

export async function listTopics(siteId: string) {
  return prisma.techSection.findMany({ where: { siteId }, orderBy: { order: 'asc' } });
}

/** Slug, name and date only — the sitemap and the post badge need nothing else. */
export const listTopicRefs = cache(async (siteId: string) => {
  return prisma.techSection.findMany({
    where: { siteId },
    select: { slug: true, name: true, updatedAt: true },
    orderBy: { order: 'asc' },
  });
});

export const getTopic = cache(async (siteId: string, slug: string) => {
  return prisma.techSection.findUnique({ where: { siteId_slug: { siteId, slug } } });
});

/**
 * The topics with how many published posts each holds.
 *
 * Counted separately rather than with a relation count, because
 * `BlogPost.technology` stores a slug and there is no foreign key behind it.
 * Both the name and the slug are matched: posts written before the topic field
 * became free text stored whichever the dropdown handed over.
 */
export async function listTopicsWithCounts(siteId: string, publishedOnly: boolean) {
  const sections = await listTopics(siteId);

  const counts = await prisma.blogPost.groupBy({
    by: ['technology'],
    where: { siteId, ...(publishedOnly ? { published: true } : {}) },
    _count: { _all: true },
  });
  const byKey = new Map(counts.map((row) => [row.technology, row._count._all]));

  return sections.map((section) => {
    // A Set, not a sum of two lookups: a topic named "java" has the slug
    // "java", and adding the same bucket to itself reports twice as many
    // articles as exist.
    let postCount = 0;
    for (const key of new Set([section.slug, section.name])) postCount += byKey.get(key) ?? 0;
    return { ...section, postCount };
  });
}

export interface TopicInput {
  name: string;
  description?: unknown;
  icon: string;
  color: string;
  order?: unknown;
}

/**
 * Renames and re-styles a topic. The slug is deliberately not regenerated from
 * the name: it is what `BlogPost.technology` stores and what
 * `/blog/technology/<slug>` resolves, so rebuilding it on a rename would orphan
 * every post under the old value and break a published address.
 */
export async function updateTopic(siteId: string, id: string, input: TopicInput) {
  const { count } = await prisma.techSection.updateMany({
    where: { id, siteId },
    data: {
      name: input.name,
      description: typeof input.description === 'string' ? input.description.trim() : '',
      icon: input.icon,
      color: input.color,
      order: Number.isFinite(input.order) ? Number(input.order) : 0,
    },
  });
  return count > 0;
}

/**
 * How many posts on this site are filed under a topic — the question the delete
 * button has to ask before offering itself.
 *
 * Matches the name as well as the slug, and so does the count shown in the
 * list. If it only matched the slug, a post written before the topic field
 * became free text — those stored the name — would not be seen here, and
 * deleting the topic would leave it published and invisible in every filter,
 * which is the exact outcome the check exists to prevent.
 */
export async function countPostsUnder(
  siteId: string,
  topic: { slug: string; name: string },
  publishedOnly = false
) {
  return prisma.blogPost.count({
    where: {
      siteId,
      ...(publishedOnly ? { published: true } : {}),
      OR: [{ technology: topic.slug }, { technology: topic.name }],
    },
  });
}

export async function deleteTopic(siteId: string, id: string) {
  const { count } = await prisma.techSection.deleteMany({ where: { id, siteId } });
  return count > 0;
}

export async function getTopicById(siteId: string, id: string) {
  return prisma.techSection.findFirst({ where: { id, siteId } });
}

/**
 * Returns the slug a post should be filed under, creating the topic if it is
 * new.
 *
 * Case- and punctuation-insensitive by way of the slug: typing "Spring Boot"
 * when `spring-boot` exists files the post under the existing topic rather than
 * making a near-duplicate. That is the whole reason the lookup is on the slug
 * and not on the name.
 */
export async function ensureTopic(siteId: string, input: string): Promise<string> {
  const name = input.trim();
  if (!name) return '';

  const slug = topicSlug(name);
  if (!slug) return '';

  const existing = await prisma.techSection.findUnique({
    where: { siteId_slug: { siteId, slug } },
  });
  if (existing) return existing.slug;

  // New topics sort last. Putting them first would silently reorder the blog's
  // filter bar every time something was written about a new subject.
  const last = await prisma.techSection.findFirst({
    where: { siteId },
    orderBy: { order: 'desc' },
  });

  const created = await prisma.techSection.create({
    data: {
      siteId,
      name,
      slug,
      description: '',
      icon: DEFAULT_TECH_ICON,
      color: DEFAULT_TECH_COLOR,
      order: (last?.order ?? -1) + 1,
    },
  });

  return created.slug;
}
