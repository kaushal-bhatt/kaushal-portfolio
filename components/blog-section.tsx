'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSite } from '@/hooks/use-site';
import { SectionHead } from '@/components/editorial/section-head';
import { PostIndex, type IndexPost } from '@/components/editorial/post-index';

/**
 * Writing — the six most recent essays, as a contents page.
 *
 * Rows, not cards. A card grid gives every post the same visual weight and
 * makes the eye do the sorting; a contents list gives each title a full line,
 * which is what a title needs to be read rather than glanced at. The whole row
 * is the link.
 */

interface Topic {
  id: string;
  name: string;
  slug: string;
  _count?: { blogPosts: number };
}


export function BlogSection() {
  const site = useSite();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [posts, setPosts] = useState<IndexPost[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/tech-sections').then((r) => (r.ok ? r.json() : [])),
      fetch('/api/blog-posts?limit=6').then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([t, p]) => {
        setTopics(t);
        setPosts(p);
      })
      .catch((error) => console.error('Failed to fetch writing:', error))
      .finally(() => setLoaded(true));
  }, []);

  // `BlogPost.technology` stores the slug; the topic row carries the name.
  const topicName = (slug: string) => topics.find((t) => t.slug === slug)?.name ?? slug;

  // Nothing written yet: no section, rather than a heading over an empty list.
  if (loaded && posts.length === 0) return null;

  return (
    <section id="writing" aria-labelledby="writing-title" className="ed-section">
      <SectionHead
        number="03"
        label="Writing"
        id="writing-title"
        heading={site.blogHeading}
        accent={site.blogHeadingAccent}
        lead={site.blogSubtitle}
      />

      {!loaded && <div style={{ minHeight: '50vh' }} aria-hidden="true" />}

      {/* --- topics -------------------------------------------------------- */}
      {topics.length > 0 && (
        <div className="ed-grid pt-[clamp(2.5rem,5vw,4rem)]">
          <ul className="col-4-12 flex flex-wrap items-center gap-2" aria-label="Topics">
            <li className="ed-label mr-3">Filed under</li>
            {topics
              .filter((t) => (t._count?.blogPosts ?? 0) > 0)
              .map((t) => (
                <li key={t.id}>
                  <Link href={`/blog/technology/${t.slug}`} className="ed-tag">
                    {t.name}
                    <span className="ml-2">
                      {t._count?.blogPosts ?? 0}
                    </span>
                  </Link>
                </li>
              ))}
          </ul>
        </div>
      )}

      {/* --- contents ------------------------------------------------------ */}
      <div className="pt-[clamp(3rem,6vw,5rem)]">
        <PostIndex posts={posts} topicName={topicName} />
      </div>

      <div className="ed-grid">
        <hr className="ed-rule col-all" />
        <div className="col-all flex justify-end pt-8">
          <Link href="/blog" className="ed-btn ed-btn-ghost">
            Every essay <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
