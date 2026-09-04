import { NextRequest, NextResponse } from 'next/server';
import { writerSite } from '@/lib/access';
import { createExperience, listExperience } from '@/lib/content/experience';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Verified server-side: signature, issuer, audience, the required role and a
    // grant on this site. The middleware ahead of this only chooses redirects -
    // it verifies nothing.
    const writer = await writerSite();
    if (!writer.ok) return writer.response;

    return NextResponse.json(await listExperience(writer.siteId));
  } catch (error) {
    console.error('Portfolio fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch portfolio items' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const writer = await writerSite();
    if (!writer.ok) return writer.response;

    const data = await request.json();

    return NextResponse.json(await createExperience(writer.siteId, data));
  } catch (error) {
    console.error('Portfolio creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create portfolio item' },
      { status: 500 }
    );
  }
}
