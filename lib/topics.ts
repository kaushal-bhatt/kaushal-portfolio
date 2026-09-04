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
 */

/**
 * Returns the slug a post should be filed under, creating the topic if it is
 * new.
 *
 * Case- and punctuation-insensitive by way of the slug: typing "Spring Boot"
 * when `spring-boot` exists files the post under the existing topic rather than
 * making a near-duplicate. That is the whole reason the lookup is on the slug
 * and not on the name.
 */
export async function ensureTechSection(input: string): Promise<string> {
  const name = input.trim();
  if (!name) return '';

  const slug = topicSlug(name);
  if (!slug) return '';

  const existing = await prisma.techSection.findUnique({ where: { slug } });
  if (existing) return existing.slug;

  // New topics sort last. Putting them first would silently reorder the blog's
  // filter bar every time something was written about a new subject.
  const last = await prisma.techSection.findFirst({ orderBy: { order: 'desc' } });

  const created = await prisma.techSection.create({
    data: {
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
