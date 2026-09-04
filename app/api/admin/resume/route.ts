import { NextRequest, NextResponse } from 'next/server';
import { writerSite } from '@/lib/access';
import { createResume, getResumeById, listResumes, uniqueResumeSlug } from '@/lib/content/resume';
import { resumeContentOf, slugify } from '@/lib/resume-content';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Verified server-side: signature, issuer, audience, the required role and a
    // grant on this site. The middleware ahead of this only chooses redirects —
    // it verifies nothing.
    const writer = await writerSite();
    if (!writer.ok) return writer.response;

    return NextResponse.json(await listResumes(writer.siteId));
  } catch (error) {
    console.error('Résumé list error:', error);

    // The real reason, not a generic string. This route is behind the admin
    // session, and the caller can already read the whole site through the
    // panel — so there is nothing here a message could disclose that they do
    // not already have. The first failure of this route was a column that did
    // not exist yet, and "Failed to list résumés" sent the reader looking for
    // deleted rows instead of an unapplied migration.
    const detail = error instanceof Error ? error.message.split('\n')[0] : String(error);
    return NextResponse.json({ error: `Failed to list résumés — ${detail}` }, { status: 500 });
  }
}

/**
 * Creates one, optionally as a copy of another.
 *
 * Copying is the whole point of having more than one row: the way a CV is
 * edited is by replacing it, and the version being replaced is the one wanted
 * back later. Duplicating first means the old one is still there, unpublished,
 * when the new draft turns out worse.
 *
 * A new résumé is always created unpublished, copy or not. Publishing is a
 * separate, deliberate action — a duplicate that arrived live would put two
 * near-identical CVs on the site the moment the button was pressed.
 */
export async function POST(request: NextRequest) {
  try {
    const writer = await writerSite();
    if (!writer.ok) return writer.response;

    const body = await request.json().catch(() => ({}));
    const from = typeof body?.from === 'string' ? body.from : null;

    // Copying reads through the site-scoped getter, so "copy from" cannot reach
    // the other portfolio's CV by id.
    const source = from ? await getResumeById(writer.siteId, from) : null;
    if (from && !source) {
      return NextResponse.json({ error: 'Nothing to copy from' }, { status: 404 });
    }

    const label = source ? `${source.label} (copy)` : 'Untitled résumé';

    const created = await createResume(writer.siteId, {
      slug: await uniqueResumeSlug(writer.siteId, slugify(label) || 'resume'),
      label,
      content: resumeContentOf(source ?? {}),
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error('Résumé create error:', error);
    return NextResponse.json({ error: 'Failed to create résumé' }, { status: 500 });
  }
}
