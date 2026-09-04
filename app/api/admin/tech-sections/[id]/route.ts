import { NextRequest, NextResponse } from 'next/server';
import { writerSite } from '@/lib/access';
import { countPostsUnder, deleteTopic, getTopicById, updateTopic } from '@/lib/content/topics';
import { invalidTechVisual } from '@/lib/tech-visuals';

export const dynamic = 'force-dynamic';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const writer = await writerSite();
    if (!writer.ok) return writer.response;

    const body = await request.json();
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // Icon and colour are keys into lib/tech-visuals.ts, and an unknown key
    // falls back silently at render time. Catching it here means the admin is
    // told the value did not take, rather than saving happily and wondering why
    // the topic is still grey.
    const invalid = invalidTechVisual({ icon: body.icon, color: body.color });
    if (invalid) {
      return NextResponse.json({ error: invalid }, { status: 400 });
    }

    // The slug is deliberately not regenerated from the name — see the note on
    // `updateTopic`.
    if (!(await updateTopic(writer.siteId, params.id, { ...body, name }))) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'A topic with that name already exists' },
        { status: 409 }
      );
    }
    console.error('Topic update error:', error);
    return NextResponse.json({ error: 'Failed to save topic' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const writer = await writerSite();
    if (!writer.ok) return writer.response;

    const section = await getTopicById(writer.siteId, params.id);
    if (!section) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Refused rather than cascaded. Posts reference a topic by slug with no
    // foreign key behind it, so deleting one with posts still under it leaves
    // them filed under a value nothing resolves — they vanish from every filter
    // while still being published.
    const inUse = await countPostsUnder(writer.siteId, section);
    if (inUse > 0) {
      return NextResponse.json(
        {
          error: `${inUse} post${inUse === 1 ? '' : 's'} still filed under this topic. Move them first.`,
        },
        { status: 409 }
      );
    }

    await deleteTopic(writer.siteId, params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Topic deletion error:', error);
    return NextResponse.json({ error: 'Failed to delete topic' }, { status: 500 });
  }
}
