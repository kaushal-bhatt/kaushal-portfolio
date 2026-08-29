/**
 * Normalisation for the list-shaped content fields (`tags`, `technologies`,
 * `achievements`).
 *
 * These used to be comma-joined strings because SQLite has no array type. They
 * are real `String[]` columns in Postgres now, so the conversion this module
 * originally existed for is gone — what remains is tolerance: the admin forms
 * still submit a comma-separated text input, so anything heading for the
 * database gets normalised to an array first.
 *
 * Six helpers here had no callers outside this file and were removed with the
 * migration. `lib/safe-arrays.ts` covers the same ground on the read side; one
 * of the two should go (see PORTFOLIO-SSO-PLAN.md, Phase 5).
 */

/** Accepts an array, a comma-separated string, null or undefined. Always returns an array. */
export const stringToArray = (value: string | string[] | null | undefined): string[] => {
  if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter(Boolean);
  if (!value || !value.trim()) return [];
  return value.split(',').map((item) => item.trim()).filter(Boolean);
};

export interface BlogPostWithArrays {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  technology: string;
  published: boolean;
  authorId: string;
  tags: string[];
  readTime: number;
  createdAt: Date;
  updatedAt: Date;
}

/** Read side. A no-op for rows that came from Postgres; kept so older callers stay safe. */
export const transformBlogPostForAPI = (post: any): BlogPostWithArrays => ({
  ...post,
  tags: stringToArray(post.tags),
});

/** Write side. `tags` must reach Prisma as an array now that the column is `String[]`. */
export const transformBlogPostForDB = (post: { tags?: string | string[] | null }) => ({
  ...post,
  tags: stringToArray(post.tags),
});
