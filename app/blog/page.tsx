'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSite } from '@/hooks/use-site';
import { safeTags } from '@/lib/safe-arrays';
import { PostIndex, type IndexPost } from '@/components/editorial/post-index';

/**
 * The archive.
 *
 * Search and topic filtering happen in the browser over the full list — there
 * are tens of essays, not thousands, and a round trip per keystroke would be
 * slower than filtering what is already here.
 *
 * The frame (paper, bar, colophon) comes from app/blog/layout.tsx.
 */

interface Post extends IndexPost {
  published: boolean;
  tags: string[];
}

interface Topic {
  id: string;
  name: string;
  slug: string;
  _count?: { blogPosts: number };
}

export default function BlogPage() {
  const site = useSite();
  const [posts, setPosts] = useState<Post[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [query, setQuery] = useState('');
  const [topic, setTopic] = useState<string | null>(null);

  /*
    Every tag on an essay links here as `/blog?search=<tag>`. Read from
    window.location rather than useSearchParams, which would force this
    client-only route into a Suspense boundary at build time; the search box is
    client state anyway, so the query string only has to seed it once.
  */
  useEffect(() => {
    const initial = new URLSearchParams(window.location.search).get('search');
    if (initial) setQuery(initial);
  }, []);

  useEffect(() => {
    Promise.all([
      fetch('/api/blog-posts').then((r) => (r.ok ? r.json() : [])),
      fetch('/api/tech-sections').then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([p, t]) => {
        // An admin's session sees drafts on this route; the public archive does not.
        setPosts((p as Post[]).filter((post) => post.published));
        setTopics(t);
      })
      .catch((error) => console.error('Failed to fetch the archive:', error))
      .finally(() => setLoaded(true));
  }, []);

  const topicName = (slug: string) => topics.find((t) => t.slug === slug)?.name ?? slug;

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter((post) => {
      if (topic && post.technology.toLowerCase() !== topic.toLowerCase()) return false;
      if (!q) return true;
      return (
        post.title.toLowerCase().includes(q) ||
        post.excerpt.toLowerCase().includes(q) ||
        safeTags(post.tags).some((tag) => tag.toLowerCase().includes(q))
      );
    });
  }, [posts, query, topic]);

  const withPosts = topics.filter((t) => (t._count?.blogPosts ?? 0) > 0);

  return (
    <>
      {/* --- masthead ------------------------------------------------------ */}
      <header className="pt-16">
        <div className="ed-grid pt-6 sm:pt-10">
          <div className="col-all flex items-baseline justify-between pb-4">
            <span className="ed-label ed-label-ink">
              <span style={{ color: 'var(--signal-ink)' }}>§</span>
              <span className="mx-3" aria-hidden="true">—</span>
              Writing
            </span>
            <span className="ed-label ed-mono">
              {loaded ? `${posts.length} ${posts.length === 1 ? 'essay' : 'essays'}` : ' '}
            </span>
          </div>
        </div>
        <hr className="ed-rule" />

        <div className="ed-grid pb-[clamp(3rem,6vw,5rem)] pt-[clamp(2.5rem,6vw,5rem)]">
          <h1 className="ed-masthead col-all ed-enter">
            {site.blogPageHeading}
            {site.blogPageHeading && site.blogPageHeadingAccent && ' '}
            {site.blogPageHeadingAccent && <em className="ed-italic">{site.blogPageHeadingAccent}</em>}
          </h1>
          {site.blogPageSubtitle && (
            <p className="ed-lead col-5-12 ed-enter ed-enter-2 mt-10 text-[var(--ink-60)]">
              {site.blogPageSubtitle}
            </p>
          )}
        </div>
      </header>

      {/* --- toolbar ------------------------------------------------------- */}
      <div className="ed-grid pb-[clamp(2.5rem,5vw,4rem)]">
        <div className="col-all grid gap-8 lg:grid-cols-12 lg:gap-x-[clamp(1rem,2vw,2rem)]">
          <label className="block lg:col-span-4">
            <span className="ed-label mb-3 block">Search</span>
            {/* An underline, not a box — the input reads as a line you write
                on rather than a widget. */}
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Title, topic or tag"
              className="w-full bg-transparent pb-2 text-[var(--t-lead)] outline-none placeholder:text-[var(--ink-60)] focus-visible:outline-none"
              style={{ borderBottom: '1px solid var(--ink)', borderRadius: 0 }}
            />
          </label>

          {withPosts.length > 0 && (
            <div className="lg:col-span-8">
              <span className="ed-label mb-3 block">Topic</span>
              <ul className="flex flex-wrap gap-2" aria-label="Filter by topic">
                <li>
                  <button
                    type="button"
                    className="ed-tag"
                    aria-pressed={topic === null}
                    onClick={() => setTopic(null)}
                  >
                    All
                  </button>
                </li>
                {withPosts.map((t) => {
                  const on = topic === t.slug;
                  return (
                    <li key={t.id}>
                      <button
                        type="button"
                        className="ed-tag"
                        aria-pressed={on}
                        onClick={() => setTopic(on ? null : t.slug)}
                      >
                        {t.name}
                        <span className="ml-2">{t._count?.blogPosts ?? 0}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* --- the list ------------------------------------------------------ */}
      <section aria-label="Essays" className="pb-[clamp(5rem,10vw,9rem)]">
        {!loaded ? (
          <div style={{ minHeight: '60vh' }} aria-hidden="true" />
        ) : shown.length === 0 ? (
          <div className="ed-grid">
            <hr className="ed-rule col-all" style={{ borderTopColor: 'var(--ink)' }} />
            <div className="col-all py-16">
              <p className="ed-h2">
                Nothing <em className="ed-italic">matches.</em>
              </p>
              <button
                type="button"
                className="ed-btn ed-btn-ghost mt-8"
                onClick={() => {
                  setQuery('');
                  setTopic(null);
                }}
              >
                Clear the filters
              </button>
            </div>
          </div>
        ) : (
          <PostIndex posts={shown} topicName={topicName} numbered={false} />
        )}
      </section>
    </>
  );
}
