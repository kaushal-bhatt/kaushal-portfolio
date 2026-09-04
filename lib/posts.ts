import { cache } from 'react';
import { prisma } from '@/lib/db';

/**
 * Server-side reads for the blog.
 *
 * These exist because the post page became a server component. It was client
 * rendered, which meant Google was handed an empty shell and every post shared
 * the site's title — twelve articles competing as one page, under a heading
 * that described none of them.
 *
 * `cache()` is React's per-request memo: `generateMetadata` and the page body
 * both need the same post, and without it every request would run the same
 * query twice. `/resume/[slug]` still does exactly that; worth copying this
 * back to it.
 */

export const getPublishedPost = cache(async (slug: string) => {
  return prisma.blogPost.findFirst({ where: { slug, published: true } });
});

/** Slug and dates only — the sitemap needs nothing else. */
export const listPublishedPostRefs = cache(async () => {
  return prisma.blogPost.findMany({
    where: { published: true },
    select: { slug: true, updatedAt: true },
    orderBy: { createdAt: 'desc' },
  });
});

export const listTechSectionRefs = cache(async () => {
  return prisma.techSection.findMany({
    select: { slug: true, name: true, updatedAt: true },
    orderBy: { order: 'asc' },
  });
});

export const getTechSection = cache(async (slug: string) => {
  return prisma.techSection.findUnique({ where: { slug } });
});

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
