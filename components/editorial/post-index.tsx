import Link from 'next/link';
import { formatDate, readingTime } from '@/components/editorial/format';

/**
 * A list of essays as a contents page — shared by /blog and the topic pages so
 * the two cannot drift into different designs for the same thing.
 *
 * Every row is one link. `numbered` puts a folio down the left; the full index
 * leaves it off, because "37" on a row says nothing a date does not.
 */

export interface IndexPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  technology: string;
  readTime: number;
  createdAt: string;
}

export function PostIndex({
  posts,
  topicName,
  numbered = true,
}: {
  posts: IndexPost[];
  topicName: (slug: string) => string;
  numbered?: boolean;
}) {
  return (
    <ol className="ed-grid">
      {posts.map((post, i) => (
        <li
          key={post.id}
          className="col-all"
          style={{ borderTop: i === 0 ? '1px solid var(--ink)' : '1px solid var(--rule)' }}
        >
          <Link
            href={`/blog/post/${post.slug}`}
            className="ed-row group grid gap-y-3 py-7 lg:grid-cols-12 lg:gap-x-[clamp(1rem,2vw,2rem)] lg:py-9"
          >
            {/* Date first on the full index — it is how a reader orients in an
                archive. The folio, on the short lists. */}
            <span className="ed-label ed-mono lg:col-span-2">
              {numbered ? String(i + 1).padStart(2, '0') : formatDate(post.createdAt)}
            </span>

            <div className="lg:col-span-7">
              <h3 className="ed-h2 ed-row-title text-[clamp(1.5rem,2.6vw,2.4rem)]">{post.title}</h3>
              {post.excerpt && (
                <p className="mt-3 line-clamp-2 max-w-[60ch] text-[var(--ink-60)]">{post.excerpt}</p>
              )}
            </div>

            <div className="flex flex-wrap items-start gap-x-5 gap-y-1 lg:col-span-3 lg:flex-col lg:items-end lg:text-right">
              <span className="ed-label ed-label-ink">{topicName(post.technology)}</span>
              <span className="ed-label ed-mono">
                {numbered ? `${formatDate(post.createdAt)} · ` : ''}
                {readingTime(post.readTime)}
              </span>
              <span aria-hidden="true" className="ed-row-arrow ed-label mt-auto hidden lg:block">
                Read →
              </span>
            </div>
          </Link>
        </li>
      ))}
    </ol>
  );
}
