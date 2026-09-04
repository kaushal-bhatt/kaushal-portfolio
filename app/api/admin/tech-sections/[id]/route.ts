import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/session';
import { prisma } from '@/lib/db';
import { invalidTechVisual } from '@/lib/tech-visuals';

export const dynamic = 'force-dynamic';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!(await getAdminSession())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

    // The slug is deliberately not regenerated from the name.
    //
    // It is what `BlogPost.technology` stores and what `/blog/technology/<slug>`
    // resolves, so rebuilding it on a rename would orphan every post under the
    // old value and break a published address — the same mistake the post
    // editor used to make with its own slug.
    const section = await prisma.techSection.update({
      where: { id: params.id },
      data: {
        name,
        description: typeof body.description === 'string' ? body.description.trim() : '',
        icon: body.icon,
        color: body.color,
        order: Number.isFinite(body.order) ? Number(body.order) : 0,
      },
    });

    return NextResponse.json(section);
  } catch (error) {
    console.error('Topic update error:', error);
    return NextResponse.json({ error: 'Failed to save topic' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!(await getAdminSession())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const section = await prisma.techSection.findUnique({ where: { id: params.id } });
    if (!section) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Refused rather than cascaded. Posts reference a topic by slug with no
    // foreign key behind it, so deleting one with posts still under it leaves
    // them filed under a value nothing resolves — they vanish from every filter
    // while still being published.
    const inUse = await prisma.blogPost.count({ where: { technology: section.slug } });
    if (inUse > 0) {
      return NextResponse.json(
        {
          error: `${inUse} post${inUse === 1 ? '' : 's'} still filed under this topic. Move them first.`,
        },
        { status: 409 }
      );
    }

    await prisma.techSection.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Topic deletion error:', error);
    return NextResponse.json({ error: 'Failed to delete topic' }, { status: 500 });
  }
}
