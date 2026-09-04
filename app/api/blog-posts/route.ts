import { NextRequest, NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { requireSiteAccess, writerSite } from '@/lib/access';
import {
  createPost,
  deletePost,
  getPostById,
  listPosts,
  updatePost,
  uniquePostSlug,
} from '@/lib/content/posts';
import { ensureTopic } from '@/lib/content/topics';
import { currentSiteId } from '@/lib/site';
import { transformBlogPostForAPI, transformBlogPostForDB } from '@/lib/sqlite-helpers';
// Read live content, so this must never be evaluated at build time: the Docker
// image is built with no database reachable, and a statically prerendered
// handler would try to query one and fail the build.
export const dynamic = 'force-dynamic';

/**
 * The optional per-post preview image.
 *
 * Empty is the normal case — `opengraph-image.tsx` draws a card from the title
 * and topic, so a post always has one. This only has to reject a value that
 * would produce a broken card, and it is checked rather than trusted because
 * the URL is handed to LinkedIn and Slack to fetch: a `javascript:` or `data:`
 * value there is not a link, it is whatever the crawler decides to do with it.
 *
 * Returns the reason, or null when there is nothing wrong.
 */
function invalidOgImage(value: string): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') {
      return 'The preview image must be an http(s) URL.';
    }
  } catch {
    return 'The preview image is not a URL.';
  }
  return null;
}

export async function GET(request: NextRequest) {
  try {
    const siteId = await currentSiteId();
    if (!siteId) return NextResponse.json([]);

    const { searchParams } = new URL(request.url);
    const technology = searchParams.get('technology');
    const id = searchParams.get('id');

    // Drafts are for the author only. Established once here because the `id`
    // branch below returns early — it used to hand back any post by id, to
    // anyone, which was a third way to the same unpublished text.
    const isAdmin = (await requireSiteAccess()).ok;

    if (id) {
      const post = await getPostById(siteId, id);

      // 404 rather than 403 for a draft: the response must not confirm that one
      // exists at that id. A post belonging to the other portfolio is not found
      // here either, and by the same mechanism — the site is in the query.
      if (!post || (!post.published && !isAdmin)) {
        return NextResponse.json({ error: 'Post not found' }, { status: 404 });
      }

      return NextResponse.json(transformBlogPostForAPI(post));
    }

    // The blog page filtered drafts out in the browser, which hid them from a
    // reader and from nobody else. The admin post list uses this same route, so
    // the filter lifts for a verified admin session rather than unconditionally.
    const posts = await listPosts(siteId, { includeDrafts: isAdmin, technology });

    return NextResponse.json(posts.map((post) => transformBlogPostForAPI(post)));
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
    // Verified server-side: signature, issuer, audience, the required role AND
    // a grant on this site. The middleware ahead of this only chooses redirects
    // - it verifies nothing.
    const writer = await writerSite();
    if (!writer.ok) return writer.response;

    const body = await request.json();

    // Validate required fields
    if (!body.title || !body.excerpt || !body.content || !body.technology) {
      return NextResponse.json(
        { error: 'Required fields missing' },
        { status: 400 }
      );
    }

    // Free text, not a fixed list. An unrecognised topic creates its row here
    // rather than being refused — the editor's dropdown used to be the only
    // source of valid values, and adding one to it was a deploy.
    const technology = await ensureTopic(writer.siteId, body.technology);
    if (!technology) {
      return NextResponse.json({ error: 'Technology is required' }, { status: 400 });
    }

    const ogImageUrl = typeof body.ogImageUrl === 'string' ? body.ogImageUrl.trim() : '';
    const badImage = invalidOgImage(ogImageUrl);
    if (badImage) {
      return NextResponse.json({ error: badImage }, { status: 400 });
    }

    const base = String(body.title)
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    // Suffixed until free rather than written straight in. The slug is unique
    // per site, so two posts with the same title on one portfolio used to fail
    // the insert on a constraint the writer could not see — reported to them as
    // "failed to create blog post" and nothing else.
    const slug = await uniquePostSlug(writer.siteId, base);

    const post = await createPost(writer.siteId, slug, {
      title: body.title,
      excerpt: body.excerpt,
      content: body.content,
      technology,
      ogImageUrl,
      tags: transformBlogPostForDB({ tags: body.tags || [] }).tags,
      readTime: body.readTime || 5,
      published: body.published || false,
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
    const writer = await writerSite();
    if (!writer.ok) return writer.response;

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

    // Same as POST: retyping the topic is allowed to invent one. Guarded on
    // presence rather than truthiness because this handler also receives
    // partial updates, and an absent `technology` must not be read as an
    // instruction to clear it.
    if (typeof updateData.technology === 'string') {
      const technology = await ensureTopic(writer.siteId, updateData.technology);
      if (!technology) {
        return NextResponse.json({ error: 'Technology is required' }, { status: 400 });
      }
      updateData.technology = technology;
    }

    // Guarded on presence, like the topic above: this handler also takes
    // partial updates, and an absent field must not be read as "clear it".
    if (typeof updateData.ogImageUrl === 'string') {
      updateData.ogImageUrl = updateData.ogImageUrl.trim();
      const badImage = invalidOgImage(updateData.ogImageUrl);
      if (badImage) {
        return NextResponse.json({ error: badImage }, { status: 400 });
      }
    }

    // The slug is deliberately NOT regenerated here.
    //
    // This used to rebuild it from the title on every update. The comment said
    // "if title changed", but the condition only checked that a title was
    // *present* — and the edit page sends the whole post on every save. So every
    // save silently changed the post's URL, breaking any link to it and leaving
    // the editor's own Preview button pointing at an address that no longer
    // existed.
    //
    // A slug is a published address. It should change when someone decides to
    // change it, not as a side effect of fixing a typo. The client already sends
    // the existing slug back, so it is carried through unchanged; sending a
    // different one is how you rename a post on purpose.

    const post = await updatePost(writer.siteId, id, updateData as Prisma.BlogPostUpdateInput);
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

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
    const writer = await writerSite();
    if (!writer.ok) return writer.response;

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

    const post = await updatePost(writer.siteId, id, updateData as Prisma.BlogPostUpdateInput);
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

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
    const writer = await writerSite();
    if (!writer.ok) return writer.response;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      );
    }

    if (!(await deletePost(writer.siteId, id))) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Blog post deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete blog post' },
      { status: 500 }
    );
  }
}
