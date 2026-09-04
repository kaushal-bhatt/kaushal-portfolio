import { NextResponse } from 'next/server';
import { writerSite } from '@/lib/access';
import { listTopicsWithCounts } from '@/lib/content/topics';

export const dynamic = 'force-dynamic';

/**
 * The topics, with how many posts each holds.
 *
 * The count is why this is not just the public route: deleting a topic that
 * still has posts under it would leave them filed under a slug nothing
 * resolves, so the page needs to know before offering the button. Drafts are
 * counted here and not on the public route — an unpublished post filed under a
 * topic is still a post that would be orphaned.
 */
export async function GET() {
  try {
    // Verified server-side: signature, issuer, audience, the required role and a
    // grant on this site.
    const writer = await writerSite();
    if (!writer.ok) return writer.response;

    return NextResponse.json(await listTopicsWithCounts(writer.siteId, false));
  } catch (error) {
    console.error('Topic list error:', error);
    const detail = error instanceof Error ? error.message.split('\n')[0] : String(error);
    return NextResponse.json({ error: `Failed to load topics — ${detail}` }, { status: 500 });
  }
}
