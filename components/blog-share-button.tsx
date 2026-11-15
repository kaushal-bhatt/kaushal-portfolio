'use client';

import { useState } from 'react';

/**
 * The one interactive element in the body of an essay. The page around it is a
 * server component — the text is in the HTML a crawler receives — and only the
 * frame (the bar, smooth scrolling) and this button run in the browser.
 *
 * `navigator.share` is the phone path (it opens the real share sheet, which is
 * where a link actually gets sent from); the clipboard is the desktop
 * fallback. A share the reader cancels throws `AbortError`, which is not a
 * failure and must not be reported as one.
 */
export function BlogShareButton({ title, text }: { title: string; text: string }) {
  const [copied, setCopied] = useState(false);

  const share = async () => {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch (error) {
        if ((error as Error)?.name === 'AbortError') return;
        // Anything else falls through to the clipboard rather than leaving the
        // button looking broken.
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Could not copy the link:', error);
    }
  };

  return (
    <button type="button" onClick={share} className="ed-label ed-label-ink ed-link" aria-live="polite">
      {copied ? 'Link copied' : 'Share'}
      <span aria-hidden="true">{copied ? ' ✓' : ' ↗'}</span>
    </button>
  );
}
