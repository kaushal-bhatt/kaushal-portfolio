import { NextRequest, NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { getAdminSession } from '@/lib/session';
import { prisma } from '@/lib/db';
import {
  getResumeById,
  listResumes,
  resumeContentOf,
  slugify,
  uniqueResumeSlug,
} from '@/lib/resume';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Verified server-side: signature, issuer, audience and the required role.
    // The middleware ahead of this only chooses redirects — it verifies nothing.
    if (!(await getAdminSession())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(await listResumes());
  } catch (error) {
    console.error('Résumé list error:', error);

    // The real reason, not a generic string. This route is behind the admin
    // session, and the caller can already read the whole database through the
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
    if (!(await getAdminSession())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const from = typeof body?.from === 'string' ? body.from : null;

    const source = from ? await getResumeById(from) : null;
    if (from && !source) {
      return NextResponse.json({ error: 'Nothing to copy from' }, { status: 404 });
    }

    const label = source ? `${source.label} (copy)` : 'Untitled résumé';
    const content = resumeContentOf(source ?? {});

    const created = await prisma.resume.create({
      data: {
        slug: await uniqueResumeSlug(slugify(label) || 'resume'),
        label,
        published: false,
        // Behind everything that exists, so creating one never changes which
        // résumé /resume redirects to.
        order: (await prisma.resume.count()) + 1,
        ...content,
        phone: content.phone || null,
        skills: content.skills as unknown as Prisma.InputJsonValue,
        experience: content.experience as unknown as Prisma.InputJsonValue,
        projects: content.projects as unknown as Prisma.InputJsonValue,
        education: content.education as unknown as Prisma.InputJsonValue,
      },
      select: { id: true },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error('Résumé create error:', error);
    return NextResponse.json({ error: 'Failed to create résumé' }, { status: 500 });
  }
}
