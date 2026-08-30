import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/session';
import { prisma } from '@/lib/db';
import { invalidAboutVisual } from '@/lib/about-visuals';

export const dynamic = 'force-dynamic';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!(await getAdminSession())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();

    if (!data.label?.trim() || !data.description?.trim()) {
      return NextResponse.json({ error: 'Label and description are required' }, { status: 400 });
    }

    const bad = invalidAboutVisual(data);
    if (bad) return NextResponse.json({ error: bad }, { status: 400 });

    const stat = await prisma.aboutStat.update({
      where: { id: params.id },
      data: {
        label: data.label.trim(),
        description: data.description.trim(),
        icon: data.icon || 'Award',
        order: data.order || 0,
      },
    });

    return NextResponse.json(stat);
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
    if (!(await getAdminSession())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.aboutStat.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Stat deletion error:', error);
    return NextResponse.json({ error: 'Failed to delete figure' }, { status: 500 });
  }
}
