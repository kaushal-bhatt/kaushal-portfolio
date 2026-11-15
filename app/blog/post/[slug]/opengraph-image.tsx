import { ImageResponse } from 'next/og';
import { getPublishedPost } from '@/lib/content/posts';
import { getTopic } from '@/lib/content/topics';
import { resolveSiteRecord } from '@/lib/site';
import { SITE_DEFAULTS } from '@/lib/site-content';
import { OG, ogSignal } from '@/lib/og-palette';

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

  const signal = ogSignal(site.accent);

  // The essay's own card, in the same composition as the essay page: running
  // head with the topic in the signal colour, the title large in the display
  // face, and the byline in the apparatus face along the bottom.
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: OG.paper,
          color: OG.ink,
          padding: '56px 72px',
          fontFamily: 'serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontFamily: 'monospace',
            fontSize: 20,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            paddingBottom: 18,
            borderBottom: `2px solid ${OG.ink}`,
          }}
        >
          <span style={{ color: OG.ink60 }}>Writing</span>
          {topic ? <span style={{ color: signal }}>{topic}</span> : <span />}
        </div>

        <div
          style={{
            display: 'flex',
            marginTop: 48,
            fontSize: titleSize(title) + 6,
            lineHeight: 1.0,
            letterSpacing: '-0.03em',
          }}
        >
          {title}
        </div>

        <div
          style={{
            display: 'flex',
            marginTop: 'auto',
            justifyContent: 'space-between',
            fontFamily: 'monospace',
            fontSize: 21,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: OG.ink60,
          }}
        >
          <span style={{ color: OG.ink }}>{post?.authorName || site.fullName}</span>
          <span>
            {[readTime ? `${readTime} min read` : '', site.host].filter(Boolean).join(' · ')}
          </span>
        </div>
      </div>
    ),
    size
  );
}
