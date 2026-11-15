'use client';

import { useContext, useEffect, useState } from 'react';
import { SITE_DEFAULTS, type SiteContent } from '@/lib/site-content';
import { SiteContext } from '@/components/site-provider';

/**
 * The site's own copy — name, headline, contact links, section headings.
 *
 * Normally this is the value the root layout resolved on the server, passed
 * down through `SiteProvider`. It is in the HTML from the first byte: the name
 * in the <h1>, the nav brand, every section heading — readable by a crawler and
 * by LinkedIn's preview bot, neither of which waits for JavaScript. There is no
 * fetch and no moment where the page shows defaults and then fills in.
 *
 * The fetch below is only the fallback for a component rendered outside the
 * provider. It is cached at module scope, as before, so several such callers
 * mounting together still make one request.
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
  const fromServer = useContext(SiteContext);
  const [fetched, setFetched] = useState<SiteContent>(SITE_DEFAULTS);

  // Hooks run unconditionally; the effect just does nothing when the server
  // already supplied the answer.
  useEffect(() => {
    if (fromServer) return;
    let active = true;
    fetchSite().then((result) => {
      if (active) setFetched(result);
    });
    return () => {
      active = false;
    };
  }, [fromServer]);

  return fromServer ?? fetched;
}
