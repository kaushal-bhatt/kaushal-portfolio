import { NextRequest, NextResponse } from 'next/server';
import { requireSiteAccess } from '@/lib/access';
import { getPostBySlug } from '@/lib/content/posts';
import { currentSiteId } from '@/lib/site';
import { transformBlogPostForAPI } from '@/lib/sqlite-helpers';
// Read live content, so this must never be evaluated at build time: the Docker
// image is built with no database reachable, and a statically prerendered
// handler would try to query one and fail the build.
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const siteId = await currentSiteId();
    if (!siteId) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const post = await getPostBySlug(siteId, params.slug);

    // An unpublished post is 404 to everyone but the author. It used to be
    // returned in full — the page then said "not published yet", but the text
    // had already been handed over. 404 rather than 403 so the response does not
    // confirm that a draft exists at that address.
    if (!post || (!post.published && !(await requireSiteAccess()).ok)) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json(transformBlogPostForAPI(post));
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 });
  }
}
