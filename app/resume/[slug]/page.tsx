import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPublishedResume } from '@/lib/content/resume';
import { pdfFilename } from '@/lib/resume-content';
import { currentSiteId } from '@/lib/site';
import { ResumeDocument } from '@/components/resume-document';
import { ResumePrintButton } from '@/components/resume-print-button';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const siteId = await currentSiteId();
  const resume = siteId && (await getPublishedResume(siteId, params.slug));
  if (!resume) return { title: 'Résumé' };

  return {
    title: `${resume.fullName} — ${resume.label}`,
    description: resume.summary,
  };
}

export default async function ResumePage({ params }: { params: { slug: string } }) {
  const siteId = await currentSiteId();
  const resume = siteId && (await getPublishedResume(siteId, params.slug));

  // 404 rather than 403, and the same answer for an unpublished résumé as for
  // one that never existed. A 403 tells the caller the address is real.
  if (!resume) notFound();

  return (
    // Paper, a shade deeper than the sheet, so the white A4 page reads as a
    // document laid on a desk. `.editorial` for the type and the signal; the
    // full site frame is deliberately absent — this page exists to be printed,
    // and a navigation bar has no business on paper.
    <main
      className="editorial min-h-screen py-6 print:bg-white print:py-0"
      style={{ background: 'var(--paper-sunk)' }}
    >
      {/*
        Chrome. `no-print` rather than `print:hidden` because the same class is
        used from globals.css, where the @page rules live — one name for one
        idea, whichever side sets it.
      */}
      <div className="no-print mx-auto mb-6 flex w-full max-w-[210mm] items-center justify-between gap-4 px-4">
        <Link href="/" className="ed-label ed-label-ink ed-link">
          <span aria-hidden="true">← </span>Back to the site
        </Link>
        <ResumePrintButton filename={pdfFilename(resume)} title={`${resume.fullName} — Résumé`} />
      </div>

      <div className="px-4 print:px-0">
        <ResumeDocument resume={resume} />
      </div>

      <p className="no-print ed-label mx-auto mt-6 max-w-[210mm] px-4 text-center normal-case tracking-normal">
        &ldquo;Download PDF&rdquo; opens your browser&rsquo;s print dialog — choose Save as PDF as
        the destination. The result is a real text PDF, not an image, so it parses.
      </p>
    </main>
  );
}
