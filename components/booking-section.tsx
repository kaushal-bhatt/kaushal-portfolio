'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { CalendarDays } from 'lucide-react';
import { useBooking } from '@/hooks/use-booking';

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
    // `overflow-x-clip` for the same reason the About section has it: the
    // heading below animates in, and the embed declares a 320px minimum width.
    // Neither is allowed to widen the document, because on a phone that is not
    // a scrollbar — it is the browser zooming the whole page out to fit.
    <section id="booking" ref={ref} className="py-20 bg-slate-900 overflow-x-clip">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-10"
        >
          <div className="mb-5 inline-flex items-center justify-center rounded-lg bg-blue-500/15 p-3">
            <CalendarDays className="h-6 w-6 text-blue-300" />
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            {booking.heading} <span className="gradient-text">{booking.headingAccent}</span>
          </h2>
          {booking.subtitle && (
            <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto px-4">
              {booking.subtitle}
            </p>
          )}
        </motion.div>

        {failed ? (
          // Calendly blocked, offline, or refusing to load. A dead white box
          // teaches the visitor nothing; a link still gets them there.
          <p className="text-center text-gray-400">
            The scheduler could not load.{' '}
            <a
              href={booking.calendlyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline"
            >
              Open it on Calendly instead
            </a>
            .
          </p>
        ) : (
          /*
            A white card on a dark page, on purpose. Calendly's embed renders
            light unless the account's plan supports colour customisation, and a
            light calendar bleeding into a dark section reads as broken. Framed
            deliberately, it reads as a document — the same trick the résumé
            page uses.
          */
          <div className="overflow-hidden rounded-xl bg-white shadow-2xl">
            <div
              ref={container}
              className="min-h-[1000px] w-full sm:min-h-[700px]"
              aria-label="Booking calendar"
            />
          </div>
        )}
      </div>
    </section>
  );
}
