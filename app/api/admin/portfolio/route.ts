import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    const portfolios = await prisma.portfolio.findMany({
      orderBy: { order: 'asc' }
    });

    return NextResponse.json(portfolios);
  } catch (error) {
    console.error('Portfolio fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch portfolio items' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    const data = await request.json();
    
    const portfolio = await prisma.portfolio.create({
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
    console.error('Portfolio creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create portfolio item' },
      { status: 500 }
    );
  }
}
