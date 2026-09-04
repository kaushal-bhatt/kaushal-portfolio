import { NextRequest, NextResponse } from 'next/server';
import { writerSite } from '@/lib/access';
import { deleteProject, updateProject } from '@/lib/content/projects';

export const dynamic = 'force-dynamic';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const writer = await writerSite();
    if (!writer.ok) return writer.response;

    const data = await request.json();

    if (!(await updateProject(writer.siteId, params.id, data))) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'A project with that title already exists' },
        { status: 409 }
      );
    }
    console.error('Project update error:', error);
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const writer = await writerSite();
    if (!writer.ok) return writer.response;

    if (!(await deleteProject(writer.siteId, params.id))) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Project deletion error:', error);
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
  }
}
