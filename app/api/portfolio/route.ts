
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { transformPortfolioForAPI } from '@/lib/sqlite-helpers';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const portfolio = await prisma.portfolio.findMany({
      orderBy: {
        order: 'asc'
      }
    });

    // Transform data for API response (convert strings back to arrays)
    const transformedPortfolio = portfolio.map(transformPortfolioForAPI);

    return NextResponse.json(transformedPortfolio);
  } catch (error) {
    console.error('Portfolio fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch portfolio' },
      { status: 500 }
    );
  }
}
