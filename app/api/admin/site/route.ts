import { NextRequest, NextResponse } from 'next/server';
import { requireSiteAccess } from '@/lib/access';
import { hostTaken, normaliseSiteInput, resolveSite, saveSite } from '@/lib/site';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Verified server-side: signature, issuer, audience, the required role and a
    // grant on this site. The middleware ahead of this only chooses redirects —
    // it verifies nothing.
    const access = await requireSiteAccess();
    if (!access.ok) {
      return access.reason === 'anonymous'
        ? NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        : NextResponse.json({ error: 'You do not have access to this site' }, { status: 403 });
    }

    return NextResponse.json(access.site);
  } catch (error) {
    console.error('Site fetch error:', error);
    const detail = error instanceof Error ? error.message.split('\n')[0] : String(error);
    return NextResponse.json({ error: `Failed to load — ${detail}` }, { status: 500 });
  }
}

/**
 * Saves the site this admin is signed in to.
 *
 * Which site that is comes from the request's own host, not from the payload —
 * so an admin editing `wekt.in/admin/site` can only ever write `wekt.in`'s row,
 * and the row is addressed by its id rather than by anything the form sends.
 *
 * There is no create branch any more. A site now has to exist before it can be
 * edited, because `requireSiteAccess()` cannot decide who may edit a site that
 * is not there — the first row is inserted by SQL alongside its owner's grant.
 * The upsert this used to do would, with two hosts live, have let a request to
 * an unrecognised name conjure a third site.
 */
export async function PUT(request: NextRequest) {
  try {
    const access = await requireSiteAccess();
    if (!access.ok) {
      return access.reason === 'anonymous'
        ? NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        : NextResponse.json({ error: 'You do not have access to this site' }, { status: 403 });
    }

    const parsed = normaliseSiteInput(await request.json());
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    // Renaming the host is allowed — it is how this site moves to a new domain
    // — but it must not be able to point at another site's row.
    if (await hostTaken(parsed.value.host, access.siteId)) {
      return NextResponse.json(
        { error: `Another site already answers on ${parsed.value.host}.` },
        { status: 409 }
      );
    }

    await saveSite(access.siteId, parsed.value);

    return NextResponse.json(await resolveSite(parsed.value.host));
  } catch (error) {
    console.error('Site update error:', error);
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
}
