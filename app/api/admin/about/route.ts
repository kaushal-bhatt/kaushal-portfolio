import { NextRequest, NextResponse } from 'next/server';
import { writerSite } from '@/lib/access';
import { getAbout, saveAboutContent } from '@/lib/content/about';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Verified server-side: signature, issuer, audience, the required role and a
    // grant on this site. The middleware ahead of this only chooses redirects -
    // it verifies nothing.
    const writer = await writerSite();
    if (!writer.ok) return writer.response;

    return NextResponse.json(await getAbout(writer.siteId));
  } catch (error) {
    console.error('About fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch about content' }, { status: 500 });
  }
}

/**
 * The prose block. An upsert rather than a create/update pair: there is exactly
 * one row per site and it may not exist yet, so a PUT has to be able to make it.
 */
export async function PUT(request: NextRequest) {
  try {
    const writer = await writerSite();
    if (!writer.ok) return writer.response;

    const data = await request.json();

    if (!data.subtitle?.trim() || !data.journey?.trim()) {
      return NextResponse.json(
        { error: 'Subtitle and journey text are required' },
        { status: 400 }
      );
    }

    return NextResponse.json(await saveAboutContent(writer.siteId, data));
  } catch (error) {
    console.error('About update error:', error);
    return NextResponse.json({ error: 'Failed to save about content' }, { status: 500 });
  }
}
