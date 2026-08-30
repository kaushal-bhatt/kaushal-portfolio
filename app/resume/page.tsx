import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { prisma } from '@/lib/db';
import { ResumeDocument } from '@/components/resume-document';
import { ResumePrintButton } from '@/components/resume-print-button';

/**
 * Reads the database, so it cannot be prerendered — `next build` runs in an
 * image with no database in front of it, and everything else here that touches
 * Postgres is marked the same way for the same reason.
 */
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Kaushal Bhatt — Résumé',
  description:
    'Senior Backend Engineer — 7 years of Java, Spring Boot, Kafka and AWS across fintech, crypto custody and e-commerce. Open to EU relocation.',
};

export default async function ResumePage() {
  const resume = await prisma.resume.findUnique({ where: { id: 'main' } });

  // A 404 rather than an empty template: an address that answers with a résumé
  // shaped hole is worse than one that says there is nothing here.
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
        <ResumePrintButton />
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
