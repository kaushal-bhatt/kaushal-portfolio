import { NextRequest, NextResponse } from 'next/server';
import { writerSite } from '@/lib/access';
import { createSkill } from '@/lib/content/about';
import { invalidAboutVisual } from '@/lib/about-visuals';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Verified server-side: signature, issuer, audience, the required role and a
    // grant on this site.
    const writer = await writerSite();
    if (!writer.ok) return writer.response;

    const data = await request.json();

    if (!data.category?.trim()) {
      return NextResponse.json({ error: 'Category is required' }, { status: 400 });
    }

    const bad = invalidAboutVisual(data);
    if (bad) return NextResponse.json({ error: bad }, { status: 400 });

    return NextResponse.json(await createSkill(writer.siteId, data), { status: 201 });
  } catch (error) {
    // `category` is unique within a site, so the same card cannot be added
    // twice by accident.
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'A skill card with that category already exists' },
        { status: 409 }
      );
    }
    console.error('Skill creation error:', error);
    return NextResponse.json({ error: 'Failed to create skill' }, { status: 500 });
  }
}
