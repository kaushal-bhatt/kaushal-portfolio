import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/session';
import { prisma } from '@/lib/db';
import { normaliseSiteInput, requestHost, resolveSite } from '@/lib/site';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Verified server-side: signature, issuer, audience and the required role.
    // The middleware ahead of this only chooses redirects — it verifies nothing.
    if (!(await getAdminSession())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(await resolveSite());
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
 * so an admin editing `wekt.in/admin/site` can only ever write `wekt.in`'s row.
 * That is what makes this route correct on the day a second site exists,
 * without the form having to carry an id the caller could change.
 *
 * The upsert's create branch is for a database that has no row yet: the first
 * save from a fresh install makes the site rather than failing.
 */
export async function PUT(request: NextRequest) {
  try {
    if (!(await getAdminSession())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const parsed = normaliseSiteInput(await request.json());
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const current = await resolveSite();
    const host = current.host || requestHost();

    // Renaming the host is allowed — it is how this site moves to a new domain
    // — but it must not be able to point at another site's row.
    if (parsed.value.host !== host) {
      const clash = await prisma.site.findUnique({ where: { host: parsed.value.host } });
      if (clash) {
        return NextResponse.json(
          { error: `Another site already answers on ${parsed.value.host}.` },
          { status: 409 }
        );
      }
    }

    await prisma.site.upsert({
      where: { host },
      update: parsed.value,
      // The first row is the default one, so an unrecognised host has somewhere
      // to land from the moment there is anything at all.
      create: { ...parsed.value, isDefault: true },
    });

    return NextResponse.json(await resolveSite(parsed.value.host));
  } catch (error) {
    console.error('Site update error:', error);
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
}
