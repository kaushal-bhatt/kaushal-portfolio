'use client';

import { useEffect, useState } from 'react';
import { BOOKING_DEFAULTS, type BookingContent } from '@/lib/booking-content';

/**
 * The booking section's copy and URL.
 *
 * Cached at module scope like `use-published-resumes`, and for the same reason:
 * the navigation and the section itself both need the answer and mount
 * together, so one page load asks once. A failure clears the cache rather than
 * caching it, so the next mount retries.
 *
 * Until it resolves, `calendlyUrl` is empty — which is also what "switched off"
 * looks like. That is the right default to render during the gap: a section
 * that appears and then vanishes is worse than one that appears late.
 */
let inFlight: Promise<BookingContent> | null = null;

function fetchBooking(): Promise<BookingContent> {
  if (!inFlight) {
    inFlight = fetch('/api/booking')
      .then((response) => (response.ok ? response.json() : { ...BOOKING_DEFAULTS }))
      .catch((error) => {
        console.error('Failed to fetch booking settings:', error);
        inFlight = null;
        return { ...BOOKING_DEFAULTS };
      });
  }
  return inFlight;
}

export function useBooking(): BookingContent {
  const [booking, setBooking] = useState<BookingContent>(BOOKING_DEFAULTS);

  useEffect(() => {
    let active = true;
    fetchBooking().then((result) => {
      if (active) setBooking(result);
    });
    return () => {
      active = false;
    };
  }, []);

  return booking;
}
