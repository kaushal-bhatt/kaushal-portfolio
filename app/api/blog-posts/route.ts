import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { transformBlogPostForAPI, transformBlogPostForDB } from '@/lib/sqlite-helpers';
import { Prisma } from '@prisma/client';

// Define the expected request body type
interface CreateBlogPostRequest {
  title: string;
  excerpt: string;
  content: string;
  technology: string;
  tags?: string[];
  readTime?: number;
  published?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Validate required fields
    if (!body.title || !body.excerpt || !body.content || !body.technology) {
      return NextResponse.json(
        { error: 'Required fields missing' },
        { status: 400 }
      );
    }

    const postData: CreateBlogPostRequest = {
      title: body.title,
      excerpt: body.excerpt,
      content: body.content,
      technology: body.technology,
      tags: body.tags || [],
      readTime: body.readTime || 5,
      published: body.published || false
    };

    // Generate slug from title
    const slug = postData.title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    // Transform data for DB
    const transformedData = transformBlogPostForDB(postData);

    // Create the blog post with properly typed data
    const post = await prisma.blogPost.create({
      data: {
        title: postData.title,
        excerpt: postData.excerpt,
        content: postData.content,
        technology: postData.technology,
        tags: transformedData.tags,
        readTime: postData.readTime,
        published: postData.published,
        slug,
        authorId: session.user.id
      },
      include: {
        author: {
          select: {
            name: true
          }
        }
      }
    });

    return NextResponse.json(transformBlogPostForAPI(post), { status: 201 });
  } catch (error) {
    console.error('Blog post creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create blog post' },
      { status: 500 }
    );
  }
}