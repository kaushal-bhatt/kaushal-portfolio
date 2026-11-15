import { ImageResponse } from 'next/og';
import { resolveSite } from '@/lib/site';
import { OG, ogSignal } from '@/lib/og-palette';

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
  const signal = ogSignal(site.accent);
  const words = (site.fullName || 'Portfolio').trim().split(/\s+/);

  // The masthead, at card scale: paper, the name set large and left, the last
  // word closed with a full stop in the signal colour, and a folio line above a
  // hairline. The same composition as the top of the home page, so a link
  // pasted into LinkedIn opens onto the thing it previewed.
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
            color: OG.ink60,
            paddingBottom: 18,
            borderBottom: `2px solid ${OG.rule}`,
          }}
        >
          <span>{site.host || 'Portfolio'}</span>
          <span>{new Date().getFullYear()}</span>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            marginTop: 44,
            fontSize: words.join(' ').length > 18 ? 118 : 148,
            lineHeight: 0.88,
            letterSpacing: '-0.035em',
          }}
        >
          {words.map((word, i) => (
            <span key={i} style={{ display: 'flex' }}>
              {word}
              {i === words.length - 1 && <span style={{ color: signal }}>.</span>}
            </span>
          ))}
        </div>

        <div
          style={{
            display: 'flex',
            marginTop: 'auto',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            fontFamily: 'monospace',
            fontSize: 22,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
          }}
        >
          <span style={{ color: OG.ink }}>{site.headline}</span>
          <span style={{ color: OG.ink60 }}>{site.locationLine}</span>
        </div>
      </div>
    ),
    size
  );
}
