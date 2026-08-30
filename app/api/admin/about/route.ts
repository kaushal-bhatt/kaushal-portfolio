import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/session';
import { prisma } from '@/lib/db';
import { ABOUT_CONTENT_DEFAULTS, ABOUT_CONTENT_ID, getAbout } from '@/lib/about';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Verified server-side: signature, issuer, audience and the required role.
    // The middleware ahead of this only chooses redirects - it verifies nothing.
    if (!(await getAdminSession())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(await getAbout());
  } catch (error) {
    console.error('About fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch about content' }, { status: 500 });
  }
}

/**
 * The prose block. An upsert rather than a create/update pair: there is exactly
 * one row and it may not exist yet, so a PUT has to be able to make it.
 */
export async function PUT(request: NextRequest) {
  try {
    if (!(await getAdminSession())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();

    if (!data.subtitle?.trim() || !data.journey?.trim()) {
      return NextResponse.json(
        { error: 'Subtitle and journey text are required' },
        { status: 400 }
      );
    }

    const fields = {
      heading: data.heading?.trim() || ABOUT_CONTENT_DEFAULTS.heading,
      headingAccent: data.headingAccent?.trim() || ABOUT_CONTENT_DEFAULTS.headingAccent,
      subtitle: data.subtitle,
      journeyTitle: data.journeyTitle?.trim() || ABOUT_CONTENT_DEFAULTS.journeyTitle,
      journey: data.journey,
    };

    const content = await prisma.aboutContent.upsert({
      where: { id: ABOUT_CONTENT_ID },
      update: fields,
      create: { id: ABOUT_CONTENT_ID, ...fields },
    });

    return NextResponse.json(content);
  } catch (error) {
    console.error('About update error:', error);
    return NextResponse.json({ error: 'Failed to save about content' }, { status: 500 });
  }
}
