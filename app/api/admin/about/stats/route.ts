import { NextRequest, NextResponse } from 'next/server';
import { writerSite } from '@/lib/access';
import { createStat } from '@/lib/content/about';
import { invalidAboutVisual } from '@/lib/about-visuals';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Verified server-side: signature, issuer, audience, the required role and a
    // grant on this site.
    const writer = await writerSite();
    if (!writer.ok) return writer.response;

    const data = await request.json();

    if (!data.label?.trim() || !data.description?.trim()) {
      return NextResponse.json({ error: 'Label and description are required' }, { status: 400 });
    }

    const bad = invalidAboutVisual(data);
    if (bad) return NextResponse.json({ error: bad }, { status: 400 });

    return NextResponse.json(await createStat(writer.siteId, data), { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json({ error: 'A figure with that label already exists' }, { status: 409 });
    }
    console.error('Stat creation error:', error);
    return NextResponse.json({ error: 'Failed to create figure' }, { status: 500 });
  }
}
