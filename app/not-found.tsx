import Link from 'next/link';
import { EditorialShell } from '@/components/editorial/editorial-shell';

/**
 * The 404.
 *
 * Next's default is a white "404 | This page could not be found" in system
 * type — the one page on the site that would look like nobody designed it, and
 * it is reached more often than it sounds: a draft's address, a renamed slug,
 * a link to an essay that has since moved.
 *
 * This file sits at the root, so it renders inside the root layout only — not
 * inside app/blog/layout.tsx even when the 404 came from an essay — which is
 * why it brings its own frame.
 */
export default function NotFound() {
  return (
    <EditorialShell>
      <section className="pt-16">
        <div className="ed-grid pt-6 sm:pt-10">
          <div className="col-all flex items-baseline justify-between pb-4">
            <span className="ed-label ed-label-ink">
              <span style={{ color: 'var(--signal-ink)' }}>§</span>
              <span className="mx-3" aria-hidden="true">—</span>
              Not found
            </span>
            <span className="ed-label ed-mono">404</span>
          </div>
        </div>
        <hr className="ed-rule" />

        <div className="ed-grid pb-[clamp(6rem,12vw,11rem)] pt-[clamp(3rem,8vw,7rem)]">
          <h1 className="ed-masthead col-all ed-enter">
            Not <em className="ed-italic">here</em>
            <span style={{ color: 'var(--signal)' }}>.</span>
          </h1>
          <p className="ed-lead col-5-12 ed-enter ed-enter-2 mt-10 text-[var(--ink-60)]">
            The page at this address does not exist — or it did once, and has moved or been
            withdrawn.
          </p>
          <div className="col-5-12 ed-enter ed-enter-3 mt-10 flex flex-wrap gap-3">
            <Link href="/" className="ed-btn">
              <span aria-hidden="true">←</span> Front page
            </Link>
            <Link href="/blog" className="ed-btn ed-btn-ghost">
              Writing
            </Link>
          </div>
        </div>
      </section>
    </EditorialShell>
  );
}
