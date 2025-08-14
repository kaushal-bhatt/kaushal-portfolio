import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      );
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
        technologies: data.technologies || '',
        achievements: data.achievements || '',
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
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      );
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
