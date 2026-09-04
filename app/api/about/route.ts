import { NextResponse } from 'next/server';
import { emptyAbout, getAbout } from '@/lib/content/about';
import { currentSiteId } from '@/lib/site';

// Reads live content, so it must never be evaluated at build time: the image is
// built with no database reachable.
export const dynamic = 'force-dynamic';

/** The public About section — prose, skill cards and the figures beneath them. */
export async function GET() {
  try {
    const siteId = await currentSiteId();
    if (!siteId) return NextResponse.json(emptyAbout());

    return NextResponse.json(await getAbout(siteId));
  } catch (error) {
    console.error('About fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch about content' }, { status: 500 });
  }
}
