'use client';

import { useEffect, useState } from 'react';
import { SITE_DEFAULTS, type SiteContent } from '@/lib/site-content';

/**
 * The site's own copy — name, headline, contact links, section headings.
 *
 * Cached at module scope like `use-booking` and `use-published-resumes`, and
 * here it matters most: the navigation, the hero, three section components, the
 * footer and two pages all want the same answer and mount together. Without the
 * cache one page load asks the same question seven times.
 *
 * `SITE_DEFAULTS` renders until it resolves. That is deliberate rather than a
 * spinner: the layout is identical either way, so the page settles by filling
 * in words instead of by changing shape.
 */
let inFlight: Promise<SiteContent> | null = null;

function fetchSite(): Promise<SiteContent> {
  if (!inFlight) {
    inFlight = fetch('/api/site')
      .then((response) => (response.ok ? response.json() : { ...SITE_DEFAULTS }))
      .catch((error) => {
        console.error('Failed to fetch site settings:', error);
        // Cleared rather than cached as a failure, so the next mount retries
        // instead of leaving the site nameless for the rest of the session.
        inFlight = null;
        return { ...SITE_DEFAULTS };
      });
  }
  return inFlight;
}

export function useSite(): SiteContent {
  const [site, setSite] = useState<SiteContent>(SITE_DEFAULTS);

  useEffect(() => {
    let active = true;
    fetchSite().then((result) => {
      if (active) setSite(result);
    });
    return () => {
      active = false;
    };
  }, []);

  return site;
}
