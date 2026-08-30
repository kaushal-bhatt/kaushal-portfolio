import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Reads live content, so it must never be evaluated at build time: the image is
// built with no database reachable.
export const dynamic = 'force-dynamic';

/** The public project list behind /portfolio. */
export async function GET() {
  try {
    const projects = await prisma.project.findMany({ orderBy: { order: 'asc' } });
    return NextResponse.json(projects);
  } catch (error) {
    console.error('Projects fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}
