'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { BookingContent } from '@/lib/booking';

/**
 * The "book a call" section.
 *
 * Three lines of copy and one URL, which is the whole feature: an empty URL
 * means the section, the navigation entry and every request to Calendly are all
 * absent. That is worth saying on the page rather than only in the code,
 * because "delete the URL" is not an obvious way to turn a section off.
 */
export default function BookingManagement() {
  const router = useRouter();

  const [booking, setBooking] = useState<BookingContent | null>(null);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch('/api/admin/booking');
        if (response.ok) {
          setBooking(await response.json());
        } else {
          const body = await response.json().catch(() => ({}));
          setError(body.error ?? `Failed to load (HTTP ${response.status})`);
        }
      } catch (err) {
        console.error('Failed to load booking settings:', err);
        setError('Failed to load');
      }
    };
    load();
  }, []);

  const patch = (changes: Partial<BookingContent>) => {
    setBooking((current) => (current ? { ...current, ...changes } : current));
    setDirty(true);
    setSuccess(null);
  };

  const save = async () => {
    if (!booking) return;
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/admin/booking', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(booking),
      });

      if (response.ok) {
        setBooking(await response.json());
        setDirty(false);
        setSuccess('Saved.');
      } else {
        const body = await response.json().catch(() => ({}));
        setError(body.error ?? 'Failed to save');
      }
    } catch (err) {
      console.error('Failed to save booking settings:', err);
      setError('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (!booking) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        {error ? (
          <div className="rounded border border-red-500/40 bg-red-500/10 px-4 py-3 text-red-300">
            {error}
          </div>
        ) : (
          <p className="text-slate-400">Loading…</p>
        )}
      </div>
    );
  }

  const live = Boolean(booking.calendlyUrl);

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <div className="flex flex-wrap items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => router.push('/admin')}
          className="text-slate-400 hover:text-white"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
        <h1 className="text-2xl font-bold">Book a Call</h1>
      </div>

      {success && (
        <div className="rounded border border-green-500/40 bg-green-500/10 px-4 py-3 text-green-300">
          {success}
        </div>
      )}
      {error && (
        <div className="rounded border border-red-500/40 bg-red-500/10 px-4 py-3 text-red-300">
          {error}
        </div>
      )}

      <div
        className={`rounded border px-4 py-3 text-sm ${
          live
            ? 'border-green-500/40 bg-green-500/10 text-green-300'
            : 'border-yellow-600/30 bg-yellow-500/5 text-yellow-400'
        }`}
      >
        {live ? (
          <>The section is live on the home page, and &ldquo;Book a Call&rdquo; is in the navigation.</>
        ) : (
          <>
            No URL, so the section is off: nothing renders on the home page, the navigation entry
            is absent, and no visitor&rsquo;s browser contacts Calendly at all.
          </>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Calendly</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">Calendly URL</label>
            <Input
              placeholder="https://calendly.com/you/30min"
              value={booking.calendlyUrl}
              onChange={(e) => patch({ calendlyUrl: e.target.value })}
              className="font-mono text-sm"
            />
            <p className="mt-1 text-xs text-slate-500">
              The full link to one event type, copied from Calendly. Clear this field to switch
              the whole section off. Only <code>calendly.com</code> over https is accepted — this
              value becomes a third-party embed inside the page, so it is not treated as an
              ordinary link.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-300">Heading</label>
              <Input value={booking.heading} onChange={(e) => patch({ heading: e.target.value })} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-300">Accent word</label>
              <Input
                value={booking.headingAccent}
                onChange={(e) => patch({ headingAccent: e.target.value })}
              />
              <p className="mt-1 text-xs text-slate-500">Rendered in the gradient.</p>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">Subtitle</label>
            <Textarea
              rows={2}
              placeholder="e.g. Thirty minutes, any timezone. Happy to talk through anything on this site."
              value={booking.subtitle}
              onChange={(e) => patch({ subtitle: e.target.value })}
            />
            <p className="mt-1 text-xs text-slate-500">
              Optional — the heading stands on its own without it.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end pb-12">
        <Button onClick={save} disabled={saving || !dirty} size="lg">
          <Save className="mr-2 h-4 w-4" />
          {saving ? 'Saving…' : 'Save'}
        </Button>
      </div>
    </div>
  );
}
