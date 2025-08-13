
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { transformBlogPostForAPI } from '@/lib/sqlite-helpers';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    
    const post = await prisma.blogPost.findFirst({
      where: { slug },
      include: {
        author: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json(transformBlogPostForAPI(post));
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 });
  }
}
