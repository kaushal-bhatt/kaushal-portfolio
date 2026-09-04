import { NextRequest, NextResponse } from 'next/server';
import { writerSite } from '@/lib/access';
import { deleteExperience, updateExperience } from '@/lib/content/experience';

export const dynamic = 'force-dynamic';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const writer = await writerSite();
    if (!writer.ok) return writer.response;

    const data = await request.json();

    // The id is in the URL, so it is the caller's to choose. A row on another
    // site does not match and is reported as absent — 404 rather than 403,
    // because a response that distinguishes the two confirms the row exists.
    if (!(await updateExperience(writer.siteId, params.id, data))) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Portfolio update error:', error);
    return NextResponse.json(
      { error: 'Failed to update portfolio item' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const writer = await writerSite();
    if (!writer.ok) return writer.response;

    if (!(await deleteExperience(writer.siteId, params.id))) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Portfolio deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete portfolio item' },
      { status: 500 }
    );
  }
}
