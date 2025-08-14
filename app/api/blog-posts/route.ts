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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const technology = searchParams.get('technology');
    const id = searchParams.get('id');
    
    if (id) {
      // Get single post by ID
      const post = await prisma.blogPost.findUnique({
        where: { id },
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
    }
    
    let whereClause: any = {};
    
    if (technology) {
      whereClause = {
        OR: [
          { technology: technology },
          { technology: { contains: technology, mode: 'insensitive' } }
        ]
      };
    }

    const posts = await prisma.blogPost.findMany({
      where: whereClause,
      include: {
        author: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const transformedPosts = posts.map(post => transformBlogPostForAPI(post));
    return NextResponse.json(transformedPosts);
  } catch (error) {
    console.error('Blog posts fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog posts' },
      { status: 500 }
    );
  }
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

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      );
    }

    // If updating tags, transform them
    if (updateData.tags) {
      const transformedData = transformBlogPostForDB({ tags: updateData.tags });
      updateData.tags = transformedData.tags;
    }

    // Generate new slug if title changed
    if (updateData.title) {
      updateData.slug = updateData.title
        .toLowerCase()
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
    }

    const post = await prisma.blogPost.update({
      where: { id },
      data: updateData,
      include: {
        author: {
          select: {
            name: true
          }
        }
      }
    });

    return NextResponse.json(transformBlogPostForAPI(post));
  } catch (error) {
    console.error('Blog post update error:', error);
    return NextResponse.json(
      { error: 'Failed to update blog post' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      );
    }

    // If updating tags, transform them
    if (updateData.tags) {
      const transformedData = transformBlogPostForDB({ tags: updateData.tags });
      updateData.tags = transformedData.tags;
    }

    const post = await prisma.blogPost.update({
      where: { id },
      data: updateData,
      include: {
        author: {
          select: {
            name: true
          }
        }
      }
    });

    return NextResponse.json(transformBlogPostForAPI(post));
  } catch (error) {
    console.error('Blog post update error:', error);
    return NextResponse.json(
      { error: 'Failed to update blog post' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      );
    }

    await prisma.blogPost.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Blog post deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete blog post' },
      { status: 500 }
    );
  }
}
