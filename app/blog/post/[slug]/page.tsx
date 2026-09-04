import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Calendar, Clock, Tag, User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BlogShareButton } from '@/components/blog-share-button';
import { getPublishedPost, getTechSection, metaDescription } from '@/lib/posts';
import { resolveSite } from '@/lib/site';
import { renderMarkdown } from '@/lib/markdown';
import { safeTags } from '@/lib/safe-arrays';

/**
 * A blog post.
 *
 * This was a client component that fetched itself in a `useEffect`, which had
 * two costs. A crawler was handed an empty shell and had to run JavaScript to
 * see any of the writing. And there was no `generateMetadata`, so all twelve
 * posts inherited the root title — twelve articles competing in search as one
 * page, under a heading that described none of them.
 *
 * It is a server component now. The only thing left that needs the browser is
 * the share button.
 *
 * The entrance animations went with the conversion. They were three fades on a
 * page of text, and they are what pulled framer-motion into the bundle. They
 * are also the family of bug that widened the layout viewport twice — an
 * animated offset is a real width until it finishes.
 */

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  // The site row is not needed here any more: the image comes from the post or
  // from this route's own opengraph-image.tsx, and the title template is the
  // root layout's job.
  const post = await getPublishedPost(params.slug);
  if (!post) return { title: 'Article not found' };

  const canonical = `/blog/post/${post.slug}`;
  const description = metaDescription(post.excerpt);

  /**
   * Three levels, and the order matters.
   *
   * A post's own `ogImageUrl` wins — that is the override, for the occasional
   * article where a diagram says more than the title. Otherwise nothing is set
   * here at all, and `opengraph-image.tsx` in this folder supplies a card drawn
   * from the title and topic. Setting `images` unconditionally would suppress
   * that file, which is why the site-wide URL is *not* used as a middle step:
   * a generated card naming the article always beats a generic one.
   */
  const images = post.ogImageUrl ? [post.ogImageUrl] : undefined;

  return {
    title: post.title,
    description,
    // Without this, a post reachable at more than one address competes with
    // itself. It also tells a crawler which URL to show in a result.
    alternates: { canonical },
    openGraph: {
      type: 'article',
      title: post.title,
      description,
      url: canonical,
      publishedTime: post.createdAt.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      authors: [post.authorName],
      tags: safeTags(post.tags),
      ...(images ? { images } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description,
      ...(images ? { images } : {}),
    },
  };
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const [post, site] = await Promise.all([getPublishedPost(params.slug), resolveSite()]);

  // 404 for a draft as well as for a slug that never existed. A 403 would
  // confirm that unpublished writing sits at that address.
  if (!post) notFound();

  // Read after the guard, so a 404 does not pay for a query it will not use.
  // `cache()` means the OG image route reuses this rather than asking again.
  const section = await getTechSection(post.technology);

  const tags = safeTags(post.tags);
  const published = post.createdAt.toISOString();

  /**
   * Structured data. This is what puts an author, a date and a headline into a
   * search result instead of a bare blue link, and it is the only part of this
   * page a crawler reads rather than infers.
   */
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    datePublished: published,
    dateModified: post.updatedAt.toISOString(),
    author: { '@type': 'Person', name: post.authorName },
    keywords: tags.join(', '),
    articleSection: post.technology,
    ...(site.host
      ? {
          mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `https://${site.host}/blog/post/${post.slug}`,
          },
        }
      : {}),
    ...(site.ogImageUrl ? { image: site.ogImageUrl } : {}),
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/*
        The JSON-LD is a data block, not markup: it is serialised with
        JSON.stringify and the closing-tag sequence is escaped, because a post
        title containing `</script>` would otherwise end this element early.
      */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
      />

      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-6">
            <Link href="/blog">
              <Button variant="ghost" className="text-white hover:bg-slate-800 mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Blog
              </Button>
            </Link>
          </div>

          <div className="mb-4">
            {/*
              The topic's display name, not the slug. `BlogPost.technology`
              stores "spring-boot", so this badge read "spring-boot" — the same
              slug-versus-name confusion that once made the blog's filters match
              nothing. Falls back to the slug for a post filed under a topic
              that has since been deleted.
            */}
            <Link href={`/blog/technology/${post.technology}`}>
              <Badge variant="outline" className="border-blue-600/30 text-blue-400 mb-4">
                {section?.name ?? post.technology}
              </Badge>
            </Link>
          </div>

          <h1 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-gray-300">
            <div className="flex items-center">
              <User className="w-4 h-4 mr-2" />
              <span>by {post.authorName}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              {/*
                An explicit locale and a <time> element. `toLocaleDateString()`
                with no argument formats differently on the server and in the
                browser, which React reports as a hydration mismatch — and the
                machine-readable dateTime is what a crawler reads.
              */}
              <time dateTime={published}>
                {post.createdAt.toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </time>
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              <span>{post.readTime} min read</span>
            </div>
            <BlogShareButton title={post.title} text={post.excerpt} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-8 md:p-12">
            {/*
              No `prose` classes here: @tailwindcss/typography is not installed,
              so they generated nothing and only suggested that typography
              styling was in play. renderMarkdown emits its own.

              Still dangerouslySetInnerHTML, but renderMarkdown escapes the
              content before it formats anything — so a post body cannot inject
              markup.
            */}
            <div
              className="text-gray-300 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }}
            />

            {tags.length > 0 && (
              <div className="mt-12 pt-8 border-t border-slate-700">
                <h2 className="text-white font-semibold mb-4">Tags</h2>
                <div className="flex flex-wrap gap-2">
                  {/*
                    Real links, not click handlers. They were badges with an
                    onClick calling router.push, which meant this list needed
                    the browser and a crawler saw nothing to follow.
                  */}
                  {tags.map((tag) => (
                    <Link key={tag} href={`/blog?search=${encodeURIComponent(tag)}`}>
                      <Badge
                        variant="secondary"
                        className="bg-slate-700 text-gray-300 hover:bg-slate-600"
                      >
                        <Tag className="w-3 h-3 mr-1" />
                        {tag}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-12 text-center">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/blog">
              <Button
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-800"
              >
                View All Articles
              </Button>
            </Link>
            <Link href="/">
              <Button className="bg-blue-600 hover:bg-blue-700">Back to Portfolio</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
