import { NextResponse } from 'next/server';
import { listTopicsWithCounts } from '@/lib/content/topics';
import { currentSiteId } from '@/lib/site';

export const dynamic = 'force-dynamic';

/**
 * The blog's topics, with how many published articles each holds.
 *
 * The count used to be one query per topic in a `Promise.all` — five topics
 * meant six round trips. It is one `groupBy` now, inside
 * `listTopicsWithCounts`.
 */
export async function GET() {
  try {
    const siteId = await currentSiteId();
    if (!siteId) return NextResponse.json([]);

    const topics = await listTopicsWithCounts(siteId, true);

    // `_count.blogPosts` is the shape three components already read. Renaming
    // it here would be a rename in all of them for nothing.
    return NextResponse.json(
      topics.map(({ postCount, ...section }) => ({
        ...section,
        _count: { blogPosts: postCount },
      }))
    );
  } catch (error) {
    console.error('Tech sections fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tech sections' },
      { status: 500 }
    );
  }
}
