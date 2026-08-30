import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/session';
import { prisma } from '@/lib/db';
import { stringToArray } from '@/lib/sqlite-helpers';
import { invalidAboutVisual } from '@/lib/about-visuals';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Verified server-side: signature, issuer, audience and the required role.
    if (!(await getAdminSession())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();

    if (!data.category?.trim()) {
      return NextResponse.json({ error: 'Category is required' }, { status: 400 });
    }

    const bad = invalidAboutVisual(data);
    if (bad) return NextResponse.json({ error: bad }, { status: 400 });

    const skill = await prisma.aboutSkill.create({
      data: {
        category: data.category.trim(),
        icon: data.icon || 'Code2',
        // The form submits comma-separated text; the column is String[].
        items: stringToArray(data.items),
        color: data.color || 'blue',
        order: data.order || 0,
      },
    });

    return NextResponse.json(skill, { status: 201 });
  } catch (error) {
    // `category` is unique, so the same card cannot be added twice by accident.
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'A skill card with that category already exists' },
        { status: 409 }
      );
    }
    console.error('Skill creation error:', error);
    return NextResponse.json({ error: 'Failed to create skill' }, { status: 500 });
  }
}
