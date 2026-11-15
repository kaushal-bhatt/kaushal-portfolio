'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PostIndex, type IndexPost } from '@/components/editorial/post-index';

/**
 * One topic's essays. Metadata comes from the sibling layout.tsx; the frame
 * from app/blog/layout.tsx.
 */

interface Post extends IndexPost {
  published: boolean;
}

interface Topic {
  id: string;
  name: string;
  slug: string;
  description: string;
}

export default function TechnologyBlogPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [topic, setTopic] = useState<Topic | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [state, setState] = useState<'loading' | 'ready' | 'missing'>('loading');

  useEffect(() => {
    if (!slug) return;
    setState('loading');

    (async () => {
      try {
        const techResponse = await fetch(`/api/tech-sections/${slug}`);
        if (!techResponse.ok) {
          setState('missing');
          return;
        }
        setTopic(await techResponse.json());

        // By slug: BlogPost.technology stores the slug, and it is already in the URL.
        const postsResponse = await fetch(`/api/blog-posts?technology=${encodeURIComponent(slug)}`);
        const data: Post[] = postsResponse.ok ? await postsResponse.json() : [];
        setPosts(data.filter((post) => post.published));
        setState('ready');
      } catch (error) {
        console.error('Failed to load the topic:', error);
        setState('missing');
      }
    })();
  }, [slug]);

  if (state === 'missing') {
    return (
      <section className="pt-16">
        <div className="ed-grid py-[clamp(6rem,14vw,12rem)]">
          <p className="ed-label col-all mb-6">Topic not found</p>
          <h1 className="ed-display col-1-9">
            Nothing filed <em className="ed-italic">here.</em>
          </h1>
          <div className="col-all mt-10">
            <Link href="/blog" className="ed-btn">
              <span aria-hidden="true">←</span> All writing
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <header className="pt-16">
        <div className="ed-grid pt-6 sm:pt-10">
          <div className="col-all flex items-baseline justify-between pb-4">
            <Link href="/blog" className="ed-label ed-label-ink ed-link">
              <span aria-hidden="true">← </span>Writing
            </Link>
            <span className="ed-label ed-mono">
              {state === 'ready' ? `${posts.length} ${posts.length === 1 ? 'essay' : 'essays'}` : ' '}
            </span>
          </div>
        </div>
        <hr className="ed-rule" />

        <div className="ed-grid pb-[clamp(3rem,6vw,5rem)] pt-[clamp(2.5rem,6vw,5rem)]">
          <p className="ed-label col-all mb-4">Filed under</p>
          <h1 className="ed-masthead col-all ed-enter">
            {topic?.name ?? ' '}
            {topic && <span style={{ color: 'var(--signal)' }}>.</span>}
          </h1>
          {topic?.description && (
            <p className="ed-lead col-5-12 ed-enter ed-enter-2 mt-10 text-[var(--ink-60)]">
              {topic.description}
            </p>
          )}
        </div>
      </header>

      <section aria-label="Essays" className="pb-[clamp(5rem,10vw,9rem)]">
        {state === 'loading' ? (
          <div style={{ minHeight: '50vh' }} aria-hidden="true" />
        ) : posts.length === 0 ? (
          <div className="ed-grid">
            <hr className="ed-rule col-all" style={{ borderTopColor: 'var(--ink)' }} />
            <p className="ed-lead col-all py-16 text-[var(--ink-60)]">
              Nothing published under {topic?.name} yet.
            </p>
          </div>
        ) : (
          <PostIndex posts={posts} topicName={() => topic?.name ?? ''} numbered={false} />
        )}
      </section>
    </>
  );
}
