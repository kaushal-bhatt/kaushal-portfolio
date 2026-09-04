import { NextRequest, NextResponse } from 'next/server';
import { writerSite } from '@/lib/access';
import { deleteSkill, updateSkill } from '@/lib/content/about';
import { invalidAboutVisual } from '@/lib/about-visuals';

export const dynamic = 'force-dynamic';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const writer = await writerSite();
    if (!writer.ok) return writer.response;

    const data = await request.json();

    if (!data.category?.trim()) {
      return NextResponse.json({ error: 'Category is required' }, { status: 400 });
    }

    const bad = invalidAboutVisual(data);
    if (bad) return NextResponse.json({ error: bad }, { status: 400 });

    if (!(await updateSkill(writer.siteId, params.id, data))) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'A skill card with that category already exists' },
        { status: 409 }
      );
    }
    console.error('Skill update error:', error);
    return NextResponse.json({ error: 'Failed to update skill' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const writer = await writerSite();
    if (!writer.ok) return writer.response;

    if (!(await deleteSkill(writer.siteId, params.id))) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Skill deletion error:', error);
    return NextResponse.json({ error: 'Failed to delete skill' }, { status: 500 });
  }
}
