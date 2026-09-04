import { NextResponse } from 'next/server';
import { listProjects } from '@/lib/content/projects';
import { currentSiteId } from '@/lib/site';

// Reads live content, so it must never be evaluated at build time: the image is
// built with no database reachable.
export const dynamic = 'force-dynamic';

/** The public project list behind /portfolio. */
export async function GET() {
  try {
    const siteId = await currentSiteId();
    if (!siteId) return NextResponse.json([]);

    return NextResponse.json(await listProjects(siteId));
  } catch (error) {
    console.error('Projects fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}
