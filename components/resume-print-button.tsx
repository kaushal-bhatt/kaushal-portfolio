'use client';

import { useEffect } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * "Download PDF" is `window.print()` and nothing else.
 *
 * The alternative was rendering a PDF server-side, which means Chromium in the
 * image — a couple of hundred megabytes and a headless browser process on a
 * box with 4GB of RAM, to produce a file the browser already knows how to make.
 * Every browser's print dialog offers "Save as PDF", and the output is a real
 * text PDF that an ATS can parse, not a screenshot. The `@media print` rules in
 * globals.css are what make it come out as a document rather than a web page.
 *
 * The title swap is for the filename: browsers name the saved PDF after
 * `document.title`, so without this it saves as whatever reads well in a tab.
 * It is restored on `afterprint` rather than on the next line, because the
 * dialog outlives the call in some browsers and the tab would sit there
 * showing the filename.
 */
const PDF_FILENAME = 'Kaushal_Bhatt_Senior_Backend_Engineer';

export function ResumePrintButton() {
  useEffect(() => {
    const restore = () => {
      document.title = 'Kaushal Bhatt — Résumé';
    };
    window.addEventListener('afterprint', restore);
    return () => window.removeEventListener('afterprint', restore);
  }, []);

  const print = () => {
    document.title = PDF_FILENAME;
    window.print();
  };

  return (
    <Button
      onClick={print}
      className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
      size="sm"
    >
      <Download className="w-4 h-4 mr-2" />
      Download PDF
    </Button>
  );
}
