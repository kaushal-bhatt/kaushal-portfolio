import { NextRequest, NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { getAdminSession } from '@/lib/session';
import { prisma } from '@/lib/db';
import { getResume, normaliseResumeInput, RESUME_DEFAULTS, RESUME_ID } from '@/lib/resume';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Verified server-side: signature, issuer, audience and the required role.
    // The middleware ahead of this only chooses redirects — it verifies nothing.
    if (!(await getAdminSession())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Defaults rather than a 404 when the row is missing: the editor's job on an
    // empty database is to offer a blank form, not an error.
    return NextResponse.json((await getResume()) ?? RESUME_DEFAULTS);
  } catch (error) {
    console.error('Resume fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch résumé' }, { status: 500 });
  }
}

/**
 * Replaces the whole record.
 *
 * A PATCH per section would be less to send, but the document is edited as one
 * thing and saved with one button — a partial write would mean the page could
 * end up half-saved if one request failed, which is a state nobody can see from
 * the form.
 *
 * An upsert rather than an update: there is exactly one row, it may not exist
 * yet, and a PUT should be able to make it.
 */
export async function PUT(request: NextRequest) {
  try {
    if (!(await getAdminSession())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Same narrowing the page renders through, run over the payload. The form
    // is the only client today, but "only trusted callers reach this" is a
    // property of the current configuration rather than of the code — and it
    // also drops the blank rows an editing session leaves behind.
    const parsed = normaliseResumeInput(await request.json());
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const { skills, experience, projects, education, phone, ...scalars } = parsed.value;
    const fields = {
      ...scalars,
      // The column is nullable and the form sends "". Storing null keeps "no
      // phone number" as one value rather than two.
      phone: phone || null,
      skills: skills as unknown as Prisma.InputJsonValue,
      experience: experience as unknown as Prisma.InputJsonValue,
      projects: projects as unknown as Prisma.InputJsonValue,
      education: education as unknown as Prisma.InputJsonValue,
    };

    await prisma.resume.upsert({
      where: { id: RESUME_ID },
      update: fields,
      create: { id: RESUME_ID, ...fields },
    });

    return NextResponse.json(await getResume());
  } catch (error) {
    console.error('Resume update error:', error);
    return NextResponse.json({ error: 'Failed to save résumé' }, { status: 500 });
  }
}
