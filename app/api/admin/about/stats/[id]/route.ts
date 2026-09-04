import { NextRequest, NextResponse } from 'next/server';
import { writerSite } from '@/lib/access';
import { deleteStat, updateStat } from '@/lib/content/about';
import { invalidAboutVisual } from '@/lib/about-visuals';

export const dynamic = 'force-dynamic';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const writer = await writerSite();
    if (!writer.ok) return writer.response;

    const data = await request.json();

    if (!data.label?.trim() || !data.description?.trim()) {
      return NextResponse.json({ error: 'Label and description are required' }, { status: 400 });
    }

    const bad = invalidAboutVisual(data);
    if (bad) return NextResponse.json({ error: bad }, { status: 400 });

    if (!(await updateStat(writer.siteId, params.id, data))) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json({ error: 'A figure with that label already exists' }, { status: 409 });
    }
    console.error('Stat update error:', error);
    return NextResponse.json({ error: 'Failed to update figure' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const writer = await writerSite();
    if (!writer.ok) return writer.response;

    if (!(await deleteStat(writer.siteId, params.id))) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Stat deletion error:', error);
    return NextResponse.json({ error: 'Failed to delete figure' }, { status: 500 });
  }
}
