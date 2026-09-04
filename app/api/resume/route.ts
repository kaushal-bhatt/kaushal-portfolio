import { NextResponse } from 'next/server';
import { getPublishedResumeLinks } from '@/lib/content/resume';
import { currentSiteId } from '@/lib/site';

export const dynamic = 'force-dynamic';

/**
 * The published résumés, slug and label only.
 *
 * Public, and deliberately thin: this exists so the navigation, the hero and
 * the About band can hide their links when nothing is published, not so the
 * documents can be read from it. The documents are rendered by /resume/[slug],
 * which does its own published and site check — this endpoint returning a slug
 * is not what makes that slug readable.
 */
export async function GET() {
  try {
    const siteId = await currentSiteId();
    if (!siteId) return NextResponse.json([]);

    return NextResponse.json(await getPublishedResumeLinks(siteId));
  } catch (error) {
    console.error('Résumé link fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch résumés' }, { status: 500 });
  }
}
