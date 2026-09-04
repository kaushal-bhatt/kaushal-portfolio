import { cache } from 'react';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';

/**
 * The blog.
 *
 * The reads exist as server functions because the post page is a server
 * component. It was client rendered, which meant Google was handed an empty
 * shell and every post shared the site's title — twelve articles competing as
 * one page, under a heading that described none of them.
 *
 * `cache()` is React's per-request memo: `generateMetadata`, the page body and
 * the OG image route all want the same post, and without it every request would
 * run the same query three times.
 *
 * `siteId` first on every function — see `lib/site.ts`.
 */

export const getPublishedPost = cache(async (siteId: string, slug: string) => {
  return prisma.blogPost.findFirst({ where: { siteId, slug, published: true } });
});

/** Slug and dates only — the sitemap needs nothing else. */
export const listPublishedPostRefs = cache(async (siteId: string) => {
  return prisma.blogPost.findMany({
    where: { siteId, published: true },
    select: { slug: true, updatedAt: true },
    orderBy: { createdAt: 'desc' },
  });
});

/**
 * The list behind /blog and the admin post list.
 *
 * `includeDrafts` lifts the published filter for a verified admin session and
 * nothing else. The blog page used to filter drafts out in the browser, which
 * hid them from a reader and from nobody else.
 */
export async function listPosts(
  siteId: string,
  options: { includeDrafts?: boolean; technology?: string | null } = {}
) {
  const where: Prisma.BlogPostWhereInput = { siteId };
  if (!options.includeDrafts) where.published = true;

  if (options.technology) {
    // Exact, case-insensitive — callers pass the topic's slug, which is what
    // BlogPost.technology stores. This was a `contains` match, which is why
    // "Java" happened to find "java" while "Spring Boot" never found
    // "spring-boot": a space is not a hyphen. A substring match also quietly
    // widens the filter, so a topic named "Go" would collect every post about
    // MongoDB.
    where.technology = { equals: options.technology, mode: 'insensitive' };
  }

  return prisma.blogPost.findMany({ where, orderBy: { createdAt: 'desc' } });
}

/**
 * One post by id, for the editor.
 *
 * `findFirst` with the site in the filter rather than `findUnique` on the id:
 * the id comes from a query string, so it is the caller's to choose, and a
 * lookup that only matches on it would hand over another site's draft.
 */
export async function getPostById(siteId: string, id: string) {
  return prisma.blogPost.findFirst({ where: { id, siteId } });
}

export async function getPostBySlug(siteId: string, slug: string) {
  return prisma.blogPost.findUnique({ where: { siteId_slug: { siteId, slug } } });
}

export interface PostInput {
  title: string;
  excerpt: string;
  content: string;
  technology: string;
  ogImageUrl?: string;
  tags?: string[];
  readTime?: number;
  published?: boolean;
}

export async function createPost(siteId: string, slug: string, input: PostInput) {
  return prisma.blogPost.create({
    data: {
      siteId,
      slug,
      title: input.title,
      excerpt: input.excerpt,
      content: input.content,
      technology: input.technology,
      ogImageUrl: input.ogImageUrl ?? '',
      tags: input.tags ?? [],
      readTime: input.readTime ?? 5,
      published: input.published ?? false,
    },
  });
}

/**
 * A partial update, scoped to the site.
 *
 * `updateMany` rather than `update`: the id arrives in the request body, so
 * `update({ where: { id } })` would edit whichever site's post that id names.
 * Returns the row, or null when nothing on this site matched — which the route
 * reports as a 404 rather than as a failure, because from this site's point of
 * view that post does not exist.
 *
 * The editor sends the whole post back on every save, so `data` is a request
 * body rather than a curated object. `siteId` is stripped here rather than at
 * each call site: a payload carrying one would otherwise hand a post to the
 * other portfolio, and getting that right in three handlers means getting it
 * wrong in the fourth.
 */
export async function updatePost(siteId: string, id: string, data: Prisma.BlogPostUpdateInput) {
  const safe = { ...data } as Record<string, unknown>;
  delete safe.siteId;
  delete safe.site;
  delete safe.id;

  const { count } = await prisma.blogPost.updateMany({
    where: { id, siteId },
    data: safe as Prisma.BlogPostUpdateInput,
  });
  if (count === 0) return null;
  return getPostById(siteId, id);
}

export async function deletePost(siteId: string, id: string) {
  const { count } = await prisma.blogPost.deleteMany({ where: { id, siteId } });
  return count > 0;
}

/**
 * A slug free on this site, suffixed with -2, -3 … until it is.
 *
 * The uniqueness is per site now, so two portfolios may each have a post at
 * /blog/post/hello-world. Without this the second one silently fails the insert
 * on a constraint the writer cannot see.
 */
export async function uniquePostSlug(
  siteId: string,
  base: string,
  excludeId?: string
): Promise<string> {
  const root = base || 'post';
  const taken = await prisma.blogPost.findMany({
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
 * A description safe to put in a meta tag.
 *
 * Search engines truncate around 155 characters and a tag containing a newline
 * or a stray quote is a tag some crawlers give up on. The excerpt is written by
 * hand for every post, so this is mostly a length guard.
 */
export function metaDescription(text: string, limit = 155): string {
  const flat = text.replace(/\s+/g, ' ').trim();
  if (flat.length <= limit) return flat;
  // Cut at a word boundary rather than mid-word, then add the ellipsis the
  // search result would otherwise add itself in a worse place.
  return flat.slice(0, flat.lastIndexOf(' ', limit - 1)).trimEnd() + '…';
}
