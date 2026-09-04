import { NextRequest, NextResponse } from 'next/server';
import { countPostsUnder, getTopic } from '@/lib/content/topics';
import { currentSiteId } from '@/lib/site';
// Read live content, so this must never be evaluated at build time: the Docker
// image is built with no database reachable, and a statically prerendered
// handler would try to query one and fail the build.
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    // This file used to construct its own `new PrismaClient()` at module scope,
    // outside the singleton in lib/db.ts — a second connection pool that never
    // got cleaned up in development.
    const siteId = await currentSiteId();
    if (!siteId) {
      return NextResponse.json({ error: 'Technology section not found' }, { status: 404 });
    }

    const techSection = await getTopic(siteId, params.slug);

    // A topic belonging to the other portfolio is not found here, and by the
    // same mechanism as one that does not exist: it is simply not in the
    // result.
    if (!techSection) {
      return NextResponse.json({ error: 'Technology section not found' }, { status: 404 });
    }

    return NextResponse.json({
      ...techSection,
      // Published only — this is a public page's article count, and a draft is
      // not an article anyone can read.
      _count: { blogPosts: await countPostsUnder(siteId, techSection, true) },
    });
  } catch (error) {
    console.error('Error fetching tech section:', error);
    return NextResponse.json({ error: 'Failed to fetch tech section' }, { status: 500 });
  }
}
