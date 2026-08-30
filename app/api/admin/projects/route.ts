import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/session';
import { prisma } from '@/lib/db';
import { stringToArray } from '@/lib/sqlite-helpers';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Verified server-side: signature, issuer, audience and the required role.
    // The middleware ahead of this only chooses redirects - it verifies nothing.
    if (!(await getAdminSession())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const projects = await prisma.project.findMany({ orderBy: { order: 'asc' } });
    return NextResponse.json(projects);
  } catch (error) {
    console.error('Projects fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!(await getAdminSession())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();

    if (!data.title || !data.description || !data.githubUrl || !data.category) {
      return NextResponse.json(
        { error: 'Title, description, GitHub URL and category are required' },
        { status: 400 }
      );
    }

    const project = await prisma.project.create({
      data: {
        title: data.title,
        description: data.description,
        // The form submits comma-separated text; the column is String[].
        technologies: stringToArray(data.technologies),
        // Empty means "no demo" — stored as null so the page can hide the button
        // rather than link to an empty string.
        demoUrl: data.demoUrl?.trim() || null,
        githubUrl: data.githubUrl,
        status: data.status || 'Open Source',
        category: data.category,
        featured: data.featured || false,
        completionDate: data.completionDate || '',
        order: data.order || 0,
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error('Project creation error:', error);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}
