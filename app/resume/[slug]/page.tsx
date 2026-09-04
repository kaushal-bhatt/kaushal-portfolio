import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
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
    <main className="min-h-screen bg-slate-900 py-6 print:bg-white print:py-0">
      {/*
        Chrome. `no-print` rather than `print:hidden` because the same class is
        used from globals.css, where the @page rules live — one name for one
        idea, whichever side sets it.
      */}
      <div className="no-print mx-auto mb-6 flex w-full max-w-[210mm] items-center justify-between gap-4 px-4">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-gray-400 transition-colors hover:text-white"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to the site
        </Link>
        <ResumePrintButton filename={pdfFilename(resume)} title={`${resume.fullName} — Résumé`} />
      </div>

      <div className="px-4 print:px-0">
        <ResumeDocument resume={resume} />
      </div>

      <p className="no-print mx-auto mt-6 max-w-[210mm] px-4 text-center text-xs text-gray-500">
        &ldquo;Download PDF&rdquo; opens your browser&rsquo;s print dialog — choose{' '}
        <span className="text-gray-400">Save as PDF</span> as the destination. The result is a
        real text PDF, not an image, so it parses.
      </p>
    </main>
  );
}
