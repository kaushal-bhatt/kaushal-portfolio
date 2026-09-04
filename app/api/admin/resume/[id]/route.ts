import { NextRequest, NextResponse } from 'next/server';
import { writerSite } from '@/lib/access';
import {
  deleteResume,
  getResumeById,
  patchResume,
  uniqueResumeSlug,
  updateResume,
} from '@/lib/content/resume';
import { normaliseResumeInput, slugify } from '@/lib/resume-content';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const writer = await writerSite();
    if (!writer.ok) return writer.response;

    const resume = await getResumeById(writer.siteId, params.id);
    if (!resume) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(resume);
  } catch (error) {
    console.error('Résumé fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch résumé' }, { status: 500 });
  }
}

/**
 * Replaces the whole record.
 *
 * A PATCH per section would be less to send, but the document is edited as one
 * thing and saved with one button — a partial write would mean the CV could end
 * up half-saved in a state the form cannot show.
 */
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const writer = await writerSite();
    if (!writer.ok) return writer.response;

    const body = await request.json();

    // Same narrowing the page renders through, run over the payload. The form
    // is the only client today, but "only trusted callers reach this" is a
    // property of the current configuration rather than of the code — and it
    // also drops the blank rows an editing session leaves behind.
    const parsed = normaliseResumeInput(body);
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const label = typeof body.label === 'string' ? body.label.trim() : '';
    if (!label) {
      return NextResponse.json({ error: 'Required: label' }, { status: 400 });
    }

    // The slug follows the label unless one was typed. It is excluded from the
    // uniqueness search against itself, so saving without renaming does not
    // walk the slug to -2 every time.
    const requested = typeof body.slug === 'string' && body.slug.trim() ? body.slug : label;
    const slug = await uniqueResumeSlug(writer.siteId, slugify(requested), params.id);

    const saved = await updateResume(writer.siteId, params.id, {
      slug,
      label,
      published: Boolean(body.published),
      order: Number.isFinite(body.order) ? Number(body.order) : 0,
      content: parsed.value,
    });

    if (!saved) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(await getResumeById(writer.siteId, params.id));
  } catch (error) {
    console.error('Résumé update error:', error);
    return NextResponse.json({ error: 'Failed to save résumé' }, { status: 500 });
  }
}

/**
 * The publish toggle, and nothing else.
 *
 * Separate from PUT so the list page can flip one without holding — or having
 * fetched — the whole document. Sending the body back just to change a boolean
 * would make an unrelated stale copy of the CV the thing that gets written.
 */
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const writer = await writerSite();
    if (!writer.ok) return writer.response;

    const body = await request.json();
    const data: { published?: boolean; order?: number } = {};

    if (typeof body.published === 'boolean') data.published = body.published;
    if (Number.isFinite(body.order)) data.order = Number(body.order);

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'Nothing to change' }, { status: 400 });
    }

    const updated = await patchResume(writer.siteId, params.id, data);
    if (!updated) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Résumé patch error:', error);
    return NextResponse.json({ error: 'Failed to update résumé' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const writer = await writerSite();
    if (!writer.ok) return writer.response;

    if (!(await deleteResume(writer.siteId, params.id))) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Résumé deletion error:', error);
    return NextResponse.json({ error: 'Failed to delete résumé' }, { status: 500 });
  }
}
