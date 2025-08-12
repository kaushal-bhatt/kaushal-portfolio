
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    
    const techSection = await prisma.techSection.findFirst({
      where: { slug }
    });

    if (!techSection) {
      return NextResponse.json({ error: 'Technology section not found' }, { status: 404 });
    }

    // Count published blog posts for this technology
    // Try both techSection.name and techSection.slug for matching
    const postCount = await prisma.blogPost.count({
      where: {
        OR: [
          { technology: techSection.name, published: true },
          { technology: techSection.slug, published: true }
        ]
      }
    });

    // Add the count to the response
    const techSectionWithCount = {
      ...techSection,
      _count: {
        blogPosts: postCount
      }
    };

    return NextResponse.json(techSectionWithCount);
  } catch (error) {
    console.error('Error fetching tech section:', error);
    return NextResponse.json({ error: 'Failed to fetch tech section' }, { status: 500 });
  }
}
