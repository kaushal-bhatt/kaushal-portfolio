import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/session';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * The topics, with how many posts each holds.
 *
 * The count is why this is not just the public route: deleting a topic that
 * still has posts under it would leave them filed under a slug nothing
 * resolves, so the page needs to know before offering the button.
 */
export async function GET() {
  try {
    // Verified server-side: signature, issuer, audience and the required role.
    if (!(await getAdminSession())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sections = await prisma.techSection.findMany({ orderBy: { order: 'asc' } });

    // Counted separately because BlogPost.technology is a slug, not a relation
    // — there is no foreign key to group by.
    const counts = await prisma.blogPost.groupBy({
      by: ['technology'],
      _count: { _all: true },
    });
    const countBySlug = new Map(counts.map((row) => [row.technology, row._count._all]));

    return NextResponse.json(
      sections.map((section) => ({
        ...section,
        postCount: countBySlug.get(section.slug) ?? 0,
      }))
    );
  } catch (error) {
    console.error('Topic list error:', error);
    const detail = error instanceof Error ? error.message.split('\n')[0] : String(error);
    return NextResponse.json({ error: `Failed to load topics — ${detail}` }, { status: 500 });
  }
}
