import { Navigation } from '@/components/navigation';
import { SiteFooter } from '@/components/site-footer';
import { SmoothScroll } from '@/components/editorial/smooth-scroll';

/**
 * The frame every public page sits in: paper, the reading-progress hairline,
 * the masthead bar, smooth scrolling and the colophon.
 *
 * One component rather than the same five lines in seven pages, because the
 * version that drifts is the one somebody retypes — and a page that forgot
 * `.editorial` would render ink-on-ink.
 *
 * `home` changes only what the masthead bar links to: on the home page its
 * entries are in-page anchors, everywhere else they lead back to it.
 */
export function EditorialShell({
  children,
  home = false,
}: {
  children: React.ReactNode;
  home?: boolean;
}) {
  return (
    <div className="editorial min-h-screen">
      <div className="ed-progress" aria-hidden="true" />
      <SmoothScroll />
      <Navigation home={home} />
      <main id="main">{children}</main>
      <SiteFooter />
    </div>
  );
}
