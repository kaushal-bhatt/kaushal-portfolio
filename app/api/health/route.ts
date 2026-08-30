import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Never cached, never prerendered: a health check that answers from a build-time
// snapshot reports the health of the build, not of the running system.
export const dynamic = 'force-dynamic';

/**
 * Liveness for the uptime monitor.
 *
 * It touches the database on purpose. Monitoring the home page only proves Next.js is
 * serving — that page renders fine with Postgres face down, and the first anyone would
 * know is a visitor finding an empty portfolio and an empty blog. The cheapest query
 * that actually crosses the connection pool is the one worth making.
 *
 * A failure answers 503, not 200-with-a-sad-body, so a monitor configured only on status
 * code still catches it.
 */
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: 'UP' });
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json({ status: 'DOWN' }, { status: 503 });
  }
}
