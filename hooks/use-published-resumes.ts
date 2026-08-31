'use client';

import { useEffect, useState } from 'react';
import type { ResumeLink } from '@/lib/resume';

/**
 * The published résumés, for the four places on the site that link to one.
 *
 * The navigation, the hero, the About band and the footer all need the same
 * answer, and they mount together — so the promise is cached at module scope
 * and every caller after the first joins the request already in flight. Without
 * that, one page load asks the same question four times.
 *
 * The cache lives for the life of the tab. That is the right lifetime here: a
 * résumé being published is not something the visitor's open tab needs to learn
 * about, and the admin panel is a separate page load.
 */
let inFlight: Promise<ResumeLink[]> | null = null;

function fetchLinks(): Promise<ResumeLink[]> {
  if (!inFlight) {
    inFlight = fetch('/api/resume')
      .then((response) => (response.ok ? response.json() : []))
      .catch((error) => {
        console.error('Failed to fetch résumés:', error);
        // Not cached as a failure: clearing this lets the next mount retry
        // rather than hiding the link for the rest of the session.
        inFlight = null;
        return [];
      });
  }
  return inFlight;
}

export function usePublishedResumes(): ResumeLink[] {
  const [links, setLinks] = useState<ResumeLink[]>([]);

  useEffect(() => {
    let active = true;
    fetchLinks().then((result) => {
      if (active) setLinks(result);
    });
    return () => {
      active = false;
    };
  }, []);

  return links;
}
