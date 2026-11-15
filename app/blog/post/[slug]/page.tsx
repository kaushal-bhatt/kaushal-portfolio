import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BlogShareButton } from '@/components/blog-share-button';
import { getPublishedPost, metaDescription } from '@/lib/content/posts';
import { getTopic } from '@/lib/content/topics';
import { resolveSiteRecord } from '@/lib/site';
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
  // The site is read for its id and for the byline only. The image still comes
  // from the post or from this route's own opengraph-image.tsx, and the title
  // template is the root layout's job.
  const site = await resolveSiteRecord();
  const post = site && (await getPublishedPost(site.id, params.slug));
  if (!site || !post) return { title: 'Article not found' };

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
      authors: [post.authorName || site.content.fullName],
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
  // The site first, because the post is looked up inside it: an article on the
  // other portfolio is not at this address, and asking for it by slug alone is
  // how it would be.
  const record = await resolveSiteRecord();
  const post = record && (await getPublishedPost(record.id, params.slug));

  // 404 for a draft as well as for a slug that never existed. A 403 would
  // confirm that unpublished writing sits at that address.
  if (!record || !post) notFound();

  const site = record.content;

  // Read after the guard, so a 404 does not pay for a query it will not use.
  // `cache()` means the OG image route reuses this rather than asking again.
  const section = await getTopic(record.id, post.technology);

  // Empty is the normal case: the byline belongs to the site, and only a guest
  // post carries one of its own. The column used to default to a person's name
  // in the schema, which was invisible with one portfolio and wrong with two.
  const author = post.authorName || site.fullName;

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
    author: { '@type': 'Person', name: author },
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
    <article className="pt-16">
      {/*
        The JSON-LD is a data block, not markup: serialised with JSON.stringify
        and the closing-tag sequence escaped, because a title containing
        `</script>` would otherwise end this element early.
      */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\u003c') }}
      />

      {/* --- running head -------------------------------------------------- */}
      <div className="ed-grid pt-6 sm:pt-10">
        <div className="col-all flex flex-wrap items-baseline justify-between gap-4 pb-4">
          <Link href="/blog" className="ed-label ed-label-ink ed-link">
            <span aria-hidden="true">← </span>Writing
          </Link>
          {/*
            The topic's display name, not the slug — `BlogPost.technology`
            stores "spring-boot". Falls back to the slug for a post filed under a
            topic that has since been deleted.
          */}
          <Link href={`/blog/technology/${post.technology}`} className="ed-label ed-label-signal ed-link">
            {section?.name ?? post.technology}
          </Link>
        </div>
      </div>
      <hr className="ed-rule" />

      {/* --- title and standfirst ------------------------------------------ */}
      <header className="ed-grid pb-[clamp(2.5rem,5vw,4rem)] pt-[clamp(2.5rem,6vw,5rem)]">
        <h1 className="ed-display col-1-9 ed-enter">{post.title}</h1>

        {post.excerpt && (
          <p className="ed-italic col-4-12 ed-enter ed-enter-2 mt-10 text-[clamp(1.25rem,2vw,1.75rem)] leading-[1.35] text-[var(--ink-60)]">
            {post.excerpt}
          </p>
        )}
      </header>

      <hr className="ed-rule" />

      {/* --- byline ------------------------------------------------------- */}
      <div className="ed-grid">
        <div className="col-all flex flex-wrap items-center justify-between gap-4 py-4">
          <p className="ed-label ed-label-ink flex flex-wrap gap-x-6 gap-y-1">
            <span>By {author}</span>
            {/*
              An explicit locale and a <time> element. toLocaleDateString() with
              no argument formats differently on the server and in the browser,
              and the machine-readable dateTime is what a crawler reads.
            */}
            <time dateTime={published} className="ed-mono">
              {post.createdAt.toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </time>
            <span className="ed-mono">{post.readTime} min read</span>
          </p>
          <BlogShareButton title={post.title} text={post.excerpt} />
        </div>
      </div>
      <hr className="ed-rule ed-rule-soft" />

      {/* --- the essay -----------------------------------------------------
          The body starts at column four, so its left edge does not line up with
          the title's — and the empty columns beside it are what make a 68ch
          measure look intended rather than squeezed. */}
      <div className="ed-grid pb-[clamp(4rem,8vw,7rem)] pt-[clamp(3rem,6vw,5rem)]">
        {/*
          Still dangerouslySetInnerHTML, but renderMarkdown escapes the content
          before it formats anything — a post body cannot inject markup. The
          paper-mode type for every element it emits is `.ed-prose`, in
          app/editorial.css.
        */}
        <div
          className="col-4-12 ed-prose"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }}
        />

        {tags.length > 0 && (
          <div className="col-4-12 mt-16">
            <hr className="ed-rule mb-6" />
            <p className="ed-label mb-4">Tagged</p>
            {/* Real links: each one runs the archive's search for that tag. */}
            <ul className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <li key={tag}>
                  <Link href={`/blog?search=${encodeURIComponent(tag)}`} className="ed-tag">
                    {tag}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* --- end matter --------------------------------------------------- */}
      <div className="ed-sunk">
        <hr className="ed-rule" />
        <div className="ed-grid py-[clamp(3.5rem,7vw,6rem)]">
          <p className="ed-label col-1-5 mb-6 lg:mb-0">Continue</p>
          <div className="col-6-12 flex flex-col gap-6">
            <Link href="/blog" className="ed-h2 ed-link self-start">
              Every essay <span aria-hidden="true">→</span>
            </Link>
            <Link href="/" className="ed-h2 ed-link self-start">
              {site.fullName ? (
                <>
                  About <em className="ed-italic">{site.fullName}</em>
                </>
              ) : (
                'Home'
              )}
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
