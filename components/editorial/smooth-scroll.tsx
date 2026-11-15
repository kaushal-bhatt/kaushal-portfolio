'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';

/**
 * Inertial scrolling for the public pages.
 *
 * Lenis rather than CSS `scroll-behavior`: that only smooths programmatic jumps,
 * and what makes a long editorial page feel considered is the wheel itself
 * decelerating rather than stepping. It is about 4kb and drives native scroll —
 * the document still scrolls, so `position: sticky`, the CSS scroll timelines in
 * editorial.css and the browser's own find-in-page all keep working.
 *
 * Off entirely under `prefers-reduced-motion`, and on touch devices, where the
 * platform's own momentum is better than anything a library can add.
 */
export function SmoothScroll() {
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const touch = window.matchMedia('(pointer: coarse)').matches;
    if (reduced || touch) return;

    const lenis = new Lenis({
      duration: 1.15,
      // power4.out — the same deceleration as every transition in editorial.css.
      easing: (t) => 1 - Math.pow(1 - t, 4),
      smoothWheel: true,
    });

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    /*
      In-page anchors go through Lenis so they glide with the same curve as the
      wheel, and land below the fixed masthead bar rather than under it. Handled
      by delegation so links rendered after mount — the sections that fetch
      their content — are covered too.
    */
    const onClick = (event: MouseEvent) => {
      const link = (event.target as HTMLElement | null)?.closest('a[href^="#"]');
      if (!link) return;
      const hash = link.getAttribute('href');
      if (!hash || hash === '#') return;
      const target = document.querySelector(hash);
      if (!target) return;
      event.preventDefault();
      lenis.scrollTo(target as HTMLElement, { offset: -72 });
      history.replaceState(null, '', hash);
    };
    document.addEventListener('click', onClick);

    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener('click', onClick);
      lenis.destroy();
    };
  }, []);

  return null;
}
