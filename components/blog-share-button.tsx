'use client';

import { useState } from 'react';
import { Check, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * The only interactive thing on a blog post, and therefore the only part of
 * that page that ships JavaScript.
 *
 * The page around it is a server component now — everything else there is text,
 * and rendering text in the browser is what left Google with an empty shell.
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
    <Button
      variant="ghost"
      size="sm"
      onClick={share}
      className="text-gray-300 hover:text-white hover:bg-slate-800"
    >
      {copied ? <Check className="w-4 h-4 mr-2" /> : <Share2 className="w-4 h-4 mr-2" />}
      {copied ? 'Link copied' : 'Share'}
    </Button>
  );
}
