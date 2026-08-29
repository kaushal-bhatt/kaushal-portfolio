import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
// Read live content, so this must never be evaluated at build time: the Docker
// image is built with no database reachable, and a statically prerendered
// handler would try to query one and fail the build.
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
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
