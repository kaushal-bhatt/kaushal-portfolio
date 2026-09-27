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
import { urlSlug } from '@/lib/tech-visuals';
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

/**
 * Refuses to put a post live with nothing in its excerpt.
 *
 * The excerpt is the whole of the card on /blog and on the home page, and it is
 * the description a search result shows — a post published without one is a
 * blank card and an empty `<meta name="description">`. Drafts may be saved
 * without one, so the check belongs at the moment of publishing rather than on
 * every write.
 *
 * Both update handlers take partial bodies, so an excerpt absent from the
 * payload means "leave it alone" and has to be read from the row.
 */
async function blockedFromPublishing(
  siteId: string,
  id: string,
  update: Record<string, unknown>
): Promise<NextResponse | null> {
  if (update.published !== true) return null;

  const excerpt =
    typeof update.excerpt === 'string'
      ? update.excerpt
      : ((await getPostById(siteId, id))?.excerpt ?? '');

  if (excerpt.trim()) return null;

  return NextResponse.json(
    { error: 'An excerpt is required to publish — it is the card text and the search description.' },
    { status: 400 }
  );
}

export async function GET(request: NextRequest) {
  try {
    const siteId = await currentSiteId();
    if (!siteId) return NextResponse.json([]);

    const { searchParams } = new URL(request.url);
    const technology = searchParams.get('technology');
    const id = searchParams.get('id');

    // Bounded rather than trusted: the value is a query string, and `take: 1e9`
    // is a way to ask this handler to read the whole table. Anything
    // unparseable means "no limit", which is what every caller but the home
    // page wants.
    const requested = Number(searchParams.get('limit'));
    const limit =
      Number.isInteger(requested) && requested > 0 ? Math.min(requested, 100) : undefined;

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
    const posts = await listPosts(siteId, { includeDrafts: isAdmin, technology, limit });

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

    /**
     * Named, and the excerpt only when the post is going live.
     *
     * This demanded all four unconditionally and answered "Required fields
     * missing" — which the Save Draft button then showed for a draft that was
     * missing nothing the editor had marked as required. Its own check only
     * looked at the title, and the excerpt field is labelled optional, so the
     * writer was told something was wrong without being told what.
     *
     * An excerpt is genuinely required to publish: it is the card text on the
     * blog index and the meta description a search result shows. It is not
     * required to save a half-written draft.
     */
    const missing = ['title', 'content', 'technology'].filter((field) => !body[field]);
    if (body.published && !body.excerpt) missing.push('excerpt');
    if (missing.length) {
      return NextResponse.json({ error: `Missing: ${missing.join(', ')}.` }, { status: 400 });
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

    // `urlSlug`, not a fourth hand-rolled version of it.
    //
    // The one that was here removed every character outside [a-z0-9 -] and then
    // turned runs of whitespace into hyphens — in that order, so a title
    // beginning with an emoji ("🚀 Stop memorising…") lost the emoji, kept the
    // space after it, and published at /blog/post/-stop-memorising. `.trim()`
    // does not remove a hyphen. Two posts on the live site are at addresses
    // that start with one.
    const base = urlSlug(String(body.title));

    // Suffixed until free rather than written straight in. The slug is unique
    // per site, so two posts with the same title on one portfolio used to fail
    // the insert on a constraint the writer could not see — reported to them as
    // "failed to create blog post" and nothing else.
    const slug = await uniquePostSlug(writer.siteId, base);

    const post = await createPost(writer.siteId, slug, {
      title: body.title,
      // The column is NOT NULL with no default, and a draft is now allowed to
      // arrive without one — so the empty string has to be supplied here rather
      // than letting `undefined` reach the insert.
      excerpt: body.excerpt || '',
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

    /**
     * A slug the editor sent is normalised and made unique, not written raw.
     *
     * It reaches Prisma as-is otherwise, so renaming a post to an address
     * another post already holds failed on the composite unique and surfaced as
     * "Failed to update blog post" — and a slug typed with spaces or capitals
     * published at an address that does not match what the field said.
     *
     * `excludeId` is this post, so re-saving without changing the slug keeps it
     * rather than suffixing itself to `-2` every time.
     */
    if (typeof updateData.slug === 'string') {
      const base = urlSlug(updateData.slug);
      updateData.slug = base
        ? await uniquePostSlug(writer.siteId, base, id)
        : await uniquePostSlug(writer.siteId, urlSlug(String(updateData.title ?? '')), id);
    }

    // The slug is deliberately NOT regenerated from the title here.
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

    const blocked = await blockedFromPublishing(writer.siteId, id, updateData);
    if (blocked) return blocked;

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

    // The list's Publish button sends only `{ id, published }`, so the excerpt
    // it is being published with is the stored one.
    const blocked = await blockedFromPublishing(writer.siteId, id, updateData);
    if (blocked) return blocked;

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
