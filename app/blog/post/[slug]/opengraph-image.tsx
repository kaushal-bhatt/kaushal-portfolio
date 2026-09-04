import { ImageResponse } from 'next/og';
import { getPublishedPost } from '@/lib/content/posts';
import { getTopic } from '@/lib/content/topics';
import { resolveSiteRecord } from '@/lib/site';
import { SITE_DEFAULTS } from '@/lib/site-content';

/**
 * The card for one article.
 *
 * The site-wide image at `app/opengraph-image.tsx` is a fallback that says who
 * you are. This one says what the reader is about to get, and that is the whole
 * difference in whether a shared link is clicked: a card reading "Exactly-once
 * ends at the edge of the cluster" is a reason to open it, whereas one reading
 * "Kaushal Bhatt — Senior Backend Engineer" is a business card.
 *
 * Next picks this over the root one automatically for this route, and
 * `generateMetadata` overrides both when a post sets its own `ogImageUrl`.
 *
 * `runtime = 'nodejs'` is required: the default here is edge, where Prisma
 * cannot run. Fonts are the system stack on purpose — fetching a webfont on
 * every render is a lot to spend on an image most visitors never see.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const alt = 'Article';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/**
 * Titles here run from about 30 to 70 characters, and one size cannot hold
 * both: 68px overflows the long ones and 44px makes the short ones look like a
 * caption. Three steps is enough, and stepping on length rather than measuring
 * keeps this synchronous.
 */
function titleSize(title: string): number {
  if (title.length > 62) return 50;
  if (title.length > 42) return 58;
  return 68;
}

export default async function Image({ params }: { params: { slug: string } }) {
  const record = await resolveSiteRecord();
  const site = record?.content ?? SITE_DEFAULTS;
  const post = record && (await getPublishedPost(record.id, params.slug));

  // The page 404s an unpublished post, so this should never be reached for one
  // — but a card rendering the word "undefined" is worse than a plain one.
  const title = post?.title ?? site.fullName ?? '';
  const readTime = post?.readTime;

  // `BlogPost.technology` stores the slug, so the badge read "SPRING-BOOT"
  // rather than "Spring Boot". The topic row carries the display name; falling
  // back to the slug covers a post filed under a topic that has since been
  // deleted.
  const section = record && post ? await getTopic(record.id, post.technology) : null;
  const topic = section?.name ?? post?.technology ?? '';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px 80px',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 55%, #0f172a 100%)',
          color: 'white',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {topic && (
            <div
              style={{
                display: 'flex',
                alignSelf: 'flex-start',
                padding: '10px 22px',
                borderRadius: 999,
                border: '2px solid rgba(96,165,250,0.45)',
                color: '#93c5fd',
                fontSize: 26,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              {topic}
            </div>
          )}

          <div
            style={{
              display: 'flex',
              marginTop: 36,
              fontSize: titleSize(title),
              fontWeight: 700,
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
            }}
          >
            {title}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              display: 'flex',
              width: 260,
              height: 8,
              borderRadius: 4,
              background: 'linear-gradient(90deg, #60a5fa 0%, #a855f7 50%, #2563eb 100%)',
            }}
          />
          <div
            style={{
              display: 'flex',
              marginTop: 32,
              fontSize: 26,
              color: '#94a3b8',
              gap: 16,
            }}
          >
            <span>{post?.authorName || site.fullName}</span>
            {readTime ? <span>· {readTime} min read</span> : null}
            {site.host ? <span>· {site.host}</span> : null}
          </div>
        </div>
      </div>
    ),
    size
  );
}
