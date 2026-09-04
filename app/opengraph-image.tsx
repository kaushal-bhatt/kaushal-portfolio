import { ImageResponse } from 'next/og';
import { resolveSite } from '@/lib/site';

/**
 * The card people actually see.
 *
 * There was no Open Graph image at all, which is the single most expensive gap
 * on this site: recruiters arrive from a link pasted into LinkedIn, a message
 * or a CV far more often than from a search result, and a link with no image
 * renders as a grey box that nobody clicks. Ranking is the slow lever; this is
 * the fast one.
 *
 * Generated rather than committed, so it carries whatever the name and headline
 * currently say — and so the second portfolio gets its own without anyone
 * having to open a design tool.
 *
 * `runtime = 'nodejs'` is required: the default for this file is edge, and
 * Prisma cannot run there. Fonts are deliberately the system stack — loading a
 * webfont here means fetching it on every render, and a card is not the place
 * to spend that.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const alt = 'Portfolio';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  const site = await resolveSite();

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 55%, #0f172a 100%)',
          color: 'white',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            fontSize: 76,
            fontWeight: 700,
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
          }}
        >
          {site.fullName || 'Portfolio'}
        </div>

        {site.headline && (
          <div style={{ display: 'flex', marginTop: 24, fontSize: 36, color: '#93c5fd' }}>
            {site.headline}
          </div>
        )}

        {site.locationLine && (
          <div style={{ display: 'flex', marginTop: 16, fontSize: 26, color: '#94a3b8' }}>
            {site.locationLine}
          </div>
        )}

        {/* A rule rather than a logo — there is no mark, and inventing one for a
            card would be inventing a brand. */}
        <div
          style={{
            display: 'flex',
            marginTop: 48,
            width: 260,
            height: 8,
            borderRadius: 4,
            background: 'linear-gradient(90deg, #60a5fa 0%, #a855f7 50%, #2563eb 100%)',
          }}
        />

        {site.host && (
          <div style={{ display: 'flex', marginTop: 40, fontSize: 24, color: '#64748b' }}>
            {site.host}
          </div>
        )}
      </div>
    ),
    size
  );
}
