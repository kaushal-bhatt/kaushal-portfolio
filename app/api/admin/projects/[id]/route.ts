import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/session';
import { prisma } from '@/lib/db';
import { stringToArray } from '@/lib/sqlite-helpers';

export const dynamic = 'force-dynamic';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verified server-side: signature, issuer, audience and the required role.
    if (!(await getAdminSession())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();

    const project = await prisma.project.update({
      where: { id: params.id },
      data: {
        title: data.title,
        description: data.description,
        technologies: stringToArray(data.technologies),
        demoUrl: data.demoUrl?.trim() || null,
        githubUrl: data.githubUrl,
        status: data.status || 'Open Source',
        category: data.category,
        featured: data.featured || false,
        completionDate: data.completionDate || '',
        order: data.order || 0,
      },
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error('Project update error:', error);
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!(await getAdminSession())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.project.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Project deletion error:', error);
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
  }
}
