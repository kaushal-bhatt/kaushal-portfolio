import { NextResponse } from 'next/server';
import { resolveSite, SITE_DEFAULTS } from '@/lib/site';

export const dynamic = 'force-dynamic';

/**
 * The site the request was made to.
 *
 * Public, because everything it carries is already on the page: the name, the
 * headline, the contact links. The `Host` header is read inside `resolveSite()`
 * rather than passed in, so there is nothing here for a caller to influence.
 */
export async function GET() {
  try {
    return NextResponse.json(await resolveSite());
  } catch (error) {
    console.error('Site fetch error:', error);
    // Defaults rather than a 500. Every caller renders around this, and a
    // failure should cost the page its wording, not the page.
    return NextResponse.json(SITE_DEFAULTS);
  }
}
