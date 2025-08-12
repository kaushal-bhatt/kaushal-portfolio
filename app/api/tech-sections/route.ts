
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import type { TechSection } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const techSections = await prisma.techSection.findMany({
      orderBy: {
        order: 'asc'
      }
    });

    // Get counts separately to avoid type issues
    const sectionsWithCounts = await Promise.all(
      techSections.map(async (section: TechSection) => {
        const postCount = await prisma.blogPost.count({
          where: {
            technology: section.slug,
            published: true
          }
        });
        
        return {
          ...section,
          _count: {
            blogPosts: postCount
          }
        };
      })
    );

    return NextResponse.json(sectionsWithCounts);
  } catch (error) {
    console.error('Tech sections fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tech sections' },
      { status: 500 }
    );
  }
}
