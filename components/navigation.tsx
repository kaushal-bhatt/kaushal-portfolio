'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { usePublishedResumes } from '@/hooks/use-published-resumes';
import { useBooking } from '@/hooks/use-booking';
import { useSite } from '@/hooks/use-site';

/**
 * The masthead bar.
 *
 * Every entry is a real link. The previous version sent anything that was not
 * an in-page anchor through `window.open(href, '_blank')`, so the site's own
 * navigation opened Blog, Portfolio and Résumé in new tabs — three tabs deep
 * after a minute of browsing, with no way to middle-click by choice because
 * there was no href to middle-click.
 *
 * Entries that point at something optional are present only when it exists:
 * the résumé while one is published, the booking anchor while a Calendly URL is
 * set. A link that leads to a 404 or scrolls nowhere is worse than no link.
 */

interface Item {
  label: string;
  /** In-page section id on the home page; ignored when `path` is set. */
  anchor?: string;
  /** A separate route. */
  path?: string;
}

const SECTIONS = ['about', 'experience', 'writing', 'booking'];

export function Navigation({ home = false }: { home?: boolean }) {
  const site = useSite();
  const resumes = usePublishedResumes();
  const booking = useBooking();
  const pathname = usePathname() ?? '/';

  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);

  const items: Item[] = [
    { label: 'About', anchor: 'about' },
    { label: 'Experience', anchor: 'experience' },
    { label: 'Projects', path: '/portfolio' },
    { label: 'Writing', path: '/blog' },
    ...(resumes.length > 0 ? [{ label: 'Résumé', path: '/resume' }] : []),
    ...(booking.calendlyUrl ? [{ label: 'Book a call', anchor: 'booking' }] : []),
  ];

  /** On the home page an anchor is `#about`; anywhere else it has to lead back. */
  const hrefOf = (item: Item) => item.path ?? (home ? `#${item.anchor}` : `/#${item.anchor}`);

  // The hairline under the bar appears once the masthead has scrolled away. A
  // passive listener reading one number — not a layout query per frame.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /*
    The current section, from an IntersectionObserver. The previous version
    read offsetTop and offsetHeight of five elements on every scroll event,
    which forces layout each time; this asks the browser to tell us instead.
  */
  useEffect(() => {
    if (!home) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      // A band across the upper middle of the screen: a section is "current"
      // while it is the thing being read, not merely while an edge is visible.
      { rootMargin: '-35% 0px -55% 0px' }
    );
    const observed = SECTIONS.map((id) => document.getElementById(id)).filter(
      (el): el is HTMLElement => el !== null
    );
    observed.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
    // Re-run once the optional sections have had a chance to mount.
  }, [home, booking.calendlyUrl]);

  // Lock the page behind the open menu, and let Escape close it.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const brand = site.navBrand || site.fullName;

  return (
    <>
      <a
        href="#main"
        className="ed-label sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[110] focus:bg-[var(--ink)] focus:px-4 focus:py-3 focus:text-[var(--paper)]"
      >
        Skip to content
      </a>

      <header
        className="fixed inset-x-0 top-0 z-50 transition-[background-color,border-color] duration-500"
        style={{
          backgroundColor: scrolled || open ? 'var(--paper)' : 'transparent',
          borderBottom: `1px solid ${scrolled && !open ? 'var(--rule)' : 'transparent'}`,
          transitionTimingFunction: 'var(--ease-out)',
        }}
      >
        <nav
          aria-label="Primary"
          className="flex h-16 items-center justify-between"
          style={{ paddingInline: 'var(--gutter)' }}
        >
          <Link
            href={home ? '#top' : '/'}
            className="ed-italic text-[1.35rem] leading-none tracking-[-0.01em] text-[var(--ink)]"
            onClick={() => setOpen(false)}
          >
            {brand}
          </Link>

          <ul className="hidden items-center gap-7 lg:flex">
            {items.map((item) => {
              // A section on the home page, or the route you are on anywhere else —
              // so "Writing" is marked while reading an essay, not only on /.
              const onRoute = item.path !== undefined && pathname.startsWith(item.path);
              const isActive = onRoute || (item.anchor !== undefined && active === item.anchor);
              return (
                <li key={item.label}>
                  <Link
                    href={hrefOf(item)}
                    aria-current={onRoute ? 'page' : isActive ? 'true' : undefined}
                    className="ed-label ed-link relative transition-colors"
                    style={{ color: isActive ? 'var(--ink)' : undefined }}
                  >
                    {/* The current section gets a dot in the signal colour —
                        the one place in the bar the accent appears. */}
                    {isActive && (
                      <span
                        aria-hidden="true"
                        className="absolute -left-3 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full"
                        style={{ background: 'var(--signal)' }}
                      />
                    )}
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <button
            type="button"
            className="ed-label lg:hidden"
            style={{ color: 'var(--ink)' }}
            aria-expanded={open}
            aria-controls="ed-menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? 'Close' : 'Menu'}
          </button>
        </nav>
      </header>

      {/*
        The phone menu is a page, not a dropdown: the entries set large in the
        display face, one per line, in the thumb's half of the screen.

        Rendered only while open. It was `hidden={!open}` with `flex` in the
        class list — and the `flex` utility's `display: flex` out-ranks the
        browser's own `[hidden] { display: none }`, so the menu sat open over
        the masthead on every page load. `lg:hidden` as well, so widening the
        window with it open cannot leave it covering a desktop layout.
      */}
      {open && (
      <div
        id="ed-menu"
        // Lenis must not swallow the wheel while the menu is over the page.
        data-lenis-prevent
        className="fixed inset-0 z-40 flex flex-col justify-end lg:hidden"
        style={{ background: 'var(--paper)', paddingInline: 'var(--gutter)', paddingBottom: '3rem' }}
      >
        <p className="ed-label mb-6">Menu</p>
        <ul className="border-t" style={{ borderColor: 'var(--rule)' }}>
          {items.map((item, i) => (
            <li key={item.label} className="border-b" style={{ borderColor: 'var(--rule)' }}>
              <Link
                href={hrefOf(item)}
                onClick={() => setOpen(false)}
                className="flex items-baseline justify-between py-4"
              >
                <span className="ed-h2">{item.label}</span>
                <span className="ed-folio">{String(i + 1).padStart(2, '0')}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
      )}
    </>
  );
}
