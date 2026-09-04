import { NextResponse } from 'next/server';
import { listExperience } from '@/lib/content/experience';
import { currentSiteId } from '@/lib/site';
// Read live content, so this must never be evaluated at build time: the Docker
// image is built with no database reachable, and a statically prerendered
// handler would try to query one and fail the build.
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Which site this is comes from the request's own host, never from a
    // parameter — there is nothing here for a caller to point somewhere else.
    // No site at this address means no content, not an error.
    const siteId = await currentSiteId();
    if (!siteId) return NextResponse.json([]);

    return NextResponse.json(await listExperience(siteId));
  } catch (error) {
    console.error('Portfolio fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch portfolio items' },
      { status: 500 }
    );
  }
}
