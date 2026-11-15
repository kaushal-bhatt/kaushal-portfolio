'use client';

import { createContext } from 'react';
import type { SiteContent } from '@/lib/site-content';

/**
 * The site's copy, handed from the server to every client component.
 *
 * The root layout already resolves the site for the request — it needs it for
 * the page title and the accent class — so this costs no extra query. Before it
 * existed, `useSite()` started from empty defaults and fetched /api/site after
 * the page loaded, which meant the HTML a crawler or a link-preview bot
 * received had an empty <h1> where the name goes, and a blank nav brand on
 * every page. The name only appeared once JavaScript ran.
 *
 * Null outside the provider, so `useSite()` can tell "no server value" from a
 * real one and fall back to fetching.
 */
export const SiteContext = createContext<SiteContent | null>(null);

export function SiteProvider({ value, children }: { value: SiteContent; children: React.ReactNode }) {
  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}
