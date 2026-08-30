import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/session';
import { prisma } from '@/lib/db';
import { stringToArray } from '@/lib/sqlite-helpers';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verified server-side: signature, issuer, audience and the required role.
    // The middleware ahead of this only chooses redirects - it verifies nothing.
    if (!(await getAdminSession())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    
    const portfolio = await prisma.portfolio.update({
      where: { id: params.id },
      data: {
        company: data.company,
        role: data.role,
        startDate: data.startDate,
        endDate: data.endDate || null,
        current: data.current || false,
        description: data.description,
        // `String[]` columns since the move to Postgres. The admin form still
        // submits comma-separated text, so normalise rather than assume.
        technologies: stringToArray(data.technologies),
        achievements: stringToArray(data.achievements),
        order: data.order || 0,
      },
    });

    return NextResponse.json(portfolio);
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
    // Verified server-side: signature, issuer, audience and the required role.
    // The middleware ahead of this only chooses redirects - it verifies nothing.
    if (!(await getAdminSession())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.portfolio.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Portfolio deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete portfolio item' },
      { status: 500 }
    );
  }
}
