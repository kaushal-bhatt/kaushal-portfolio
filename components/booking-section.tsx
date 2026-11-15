'use client';

import { useEffect, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { useBooking } from '@/hooks/use-booking';
import { SectionHead } from '@/components/editorial/section-head';

/**
 * Calendly, embedded inline.
 *
 * Two things about how it loads are deliberate.
 *
 * **The script is fetched on scroll, not on page load.** Calendly's widget
 * pulls in an iframe and sets cookies, and most visitors to a portfolio never
 * reach the bottom of the home page. Waiting until the section is actually in
 * view means those visitors make no request to a third party at all, and the
 * ones who do get it are the ones about to use it.
 *
 * **The widget is initialised explicitly rather than by class name.** Dropping
 * a `.calendly-inline-widget` div into the page and letting widget.js find it
 * works exactly once — on a client-side navigation back to this page the script
 * is already loaded and its scan has already run, so the container stays empty.
 * Calling `initInlineWidget` with the container is the one path that behaves
 * the same on a first load and a return visit.
 */

const WIDGET_SRC = 'https://assets.calendly.com/assets/external/widget.js';

declare global {
  interface Window {
    Calendly?: {
      initInlineWidget: (options: { url: string; parentElement: HTMLElement }) => void;
    };
  }
}

function loadWidgetScript(): Promise<void> {
  if (window.Calendly) return Promise.resolve();

  const existing = document.querySelector<HTMLScriptElement>(`script[src="${WIDGET_SRC}"]`);
  if (existing) {
    return new Promise((resolve) => existing.addEventListener('load', () => resolve(), { once: true }));
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = WIDGET_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Calendly failed to load'));
    document.body.appendChild(script);
  });
}

export function BookingSection() {
  const booking = useBooking();
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  const container = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);
  const initialised = useRef(false);

  useEffect(() => {
    if (!inView || !booking.calendlyUrl || initialised.current) return;

    let cancelled = false;
    loadWidgetScript()
      .then(() => {
        if (cancelled || !container.current || !window.Calendly) return;
        initialised.current = true;
        window.Calendly.initInlineWidget({
          url: booking.calendlyUrl,
          parentElement: container.current,
        });
      })
      .catch((error) => {
        console.error('Calendly failed to load:', error);
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [inView, booking.calendlyUrl]);

  // Nothing configured: no section, no navigation entry, no third-party
  // request. This is also the state before the fetch resolves, which is the
  // right way round — a section that appears and then vanishes is worse than
  // one that appears a moment late.
  if (!booking.calendlyUrl) return null;

  return (
    // `overflow-x-clip`: the embed declares a 320px minimum width, and it is not
    // allowed to widen the document — on a phone that is not a scrollbar, it is
    // the browser zooming the whole page out to fit.
    <section
      id="booking"
      ref={ref}
      aria-labelledby="booking-title"
      className="ed-section overflow-x-clip"
    >
      <SectionHead
        number="04"
        label="Contact"
        id="booking-title"
        heading={booking.heading}
        accent={booking.headingAccent}
        lead={booking.subtitle}
      />

      <div className="ed-grid pt-[clamp(3rem,6vw,5rem)]">
        {failed ? (
          // Calendly blocked, offline, or refusing to load. A dead white box
          // teaches the visitor nothing; a link still gets them there.
          <p className="col-4-12 ed-lead">
            The scheduler could not load.{' '}
            <a
              href={booking.calendlyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ed-link-static"
            >
              Open it on Calendly instead
            </a>
            .
          </p>
        ) : (
          /*
            Calendly renders on white whatever the page is, so it is framed as a
            sheet laid on the paper — a hairline and nothing else — rather than
            left to bleed into the background and look like a rendering fault.
          */
          <div className="col-all" style={{ border: '1px solid var(--rule)', background: '#fff' }}>
            {/*
              `h-`, not `min-h-`. Calendly injects an iframe styled
              `height: 100%`, and a percentage height resolves against the
              parent's HEIGHT — a parent with only a min-height gives it nothing
              to resolve against, so the iframe fell back to the CSS default of
              150px. Taller on a phone because the calendar and the time list
              stack there; 700px is Calendly's own figure for side-by-side.
            */}
            <div
              ref={container}
              className="h-[1000px] w-full sm:h-[700px]"
              aria-label="Booking calendar"
            />
          </div>
        )}
      </div>
    </section>
  );
}
