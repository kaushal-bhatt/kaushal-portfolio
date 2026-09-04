'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ACCENT_NAMES, type SiteContent } from '@/lib/site-content';

/**
 * Everything that used to be a string literal in a component.
 *
 * One Save for the whole record, like the résumé editor and for the same
 * reason: this is one row, read as one thing, and a per-section write could
 * leave the site half-updated in a state the form cannot show. Nothing is
 * written until Save, which is what makes the beforeunload guard real.
 */
export default function SiteManagement() {
  const router = useRouter();

  const [site, setSite] = useState<SiteContent | null>(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch('/api/admin/site');
        if (response.ok) {
          setSite(await response.json());
        } else {
          const body = await response.json().catch(() => ({}));
          setError(body.error ?? `Failed to load (HTTP ${response.status})`);
        }
      } catch (err) {
        console.error('Failed to load site settings:', err);
        setError('Failed to load');
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const patch = (changes: Partial<SiteContent>) => {
    setSite((current) => (current ? { ...current, ...changes } : current));
    setDirty(true);
    setSuccess(null);
  };

  const save = async () => {
    if (!site) return;
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/admin/site', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(site),
      });

      if (response.ok) {
        setSite(await response.json());
        setDirty(false);
        setSuccess('Saved. Reload the site to see it.');
      } else {
        const body = await response.json().catch(() => ({}));
        setError(body.error ?? 'Failed to save');
      }
    } catch (err) {
      console.error('Failed to save site settings:', err);
      setError('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (!site) {
    return (
      <div className="mx-auto max-w-4xl p-6">
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

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div className="flex flex-wrap items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => router.push('/admin')}
          className="text-slate-400 hover:text-white"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
        <h1 className="text-2xl font-bold">Site</h1>
      </div>

      <div className="sticky top-0 z-10 -mx-6 flex flex-wrap items-center justify-between gap-3 border-b border-slate-700 bg-slate-900/95 px-6 py-3 backdrop-blur">
        <div className="text-sm text-slate-400">
          Answering on <code className="text-slate-300">{site.host || '—'}</code>
          {dirty && <span className="ml-3 text-amber-400">Unsaved changes</span>}
        </div>
        <Button onClick={save} disabled={saving || !dirty}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? 'Saving…' : 'Save'}
        </Button>
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

      {/* ---- identity ---- */}
      <Card>
        <CardHeader>
          <CardTitle>Identity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field
            label="Host *"
            hint="The domain this site answers on — no https://, no port. Changing it moves the site to a new domain; the DNS record and the Caddy block have to move with it."
          >
            <Input
              value={site.host}
              onChange={(e) => patch({ host: e.target.value })}
              className="font-mono text-sm"
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name *" hint="The hero heading and the footer copyright.">
              <Input value={site.fullName} onChange={(e) => patch({ fullName: e.target.value })} />
            </Field>
            <Field label="Navigation brand" hint="Usually the name. Blank falls back to it.">
              <Input value={site.navBrand} onChange={(e) => patch({ navBrand: e.target.value })} />
            </Field>
          </div>

          <Field label="Headline" hint="The line under the name.">
            <Input value={site.headline} onChange={(e) => patch({ headline: e.target.value })} />
          </Field>

          <Field label="Location line" hint="Shown beside the pin icon.">
            <Input
              value={site.locationLine}
              onChange={(e) => patch({ locationLine: e.target.value })}
            />
          </Field>

          <Field label="Accent" hint="The gradient on every heading accent and the nav brand.">
            <Select value={site.accent} onValueChange={(value) => patch({ accent: value })}>
              <SelectTrigger className="border-slate-600 bg-slate-800 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ACCENT_NAMES.map((name) => (
                  <SelectItem key={name} value={name}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </CardContent>
      </Card>

      {/* ---- hero ---- */}
      <Card>
        <CardHeader>
          <CardTitle>Hero</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Greeting" hint="The words before the name.">
              <Input
                value={site.heroGreeting}
                onChange={(e) => patch({ heroGreeting: e.target.value })}
              />
            </Field>
            <Field label="Primary button">
              <Input
                value={site.primaryCtaLabel}
                onChange={(e) => patch({ primaryCtaLabel: e.target.value })}
              />
            </Field>
          </div>

          <Field
            label="Intro paragraph"
            hint="Markdown — the same subset the blog uses. **bold** for the names and figures worth emphasising, [text](https://…) for links. Raw HTML is escaped, not rendered."
          >
            <Textarea
              rows={7}
              className="font-mono text-sm"
              value={site.heroIntro}
              onChange={(e) => patch({ heroIntro: e.target.value })}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Demo button label">
              <Input
                value={site.demoLabel}
                onChange={(e) => patch({ demoLabel: e.target.value })}
              />
            </Field>
            <Field label="Demo button URL" hint="Blank hides the button entirely.">
              <Input
                value={site.demoUrl}
                onChange={(e) => patch({ demoUrl: e.target.value })}
                className="font-mono text-sm"
              />
            </Field>
          </div>
        </CardContent>
      </Card>

      {/* ---- contact ---- */}
      <Card>
        <CardHeader>
          <CardTitle>Contact</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-slate-500">
            Each of these is empty-means-hidden: clear one and its icon and link disappear from
            the hero and the footer rather than pointing nowhere. The phone number is not here —
            it lives on the résumé and prints only.
          </p>
          <Field label="Email">
            <Input value={site.email} onChange={(e) => patch({ email: e.target.value })} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="LinkedIn URL">
              <Input
                value={site.linkedinUrl}
                onChange={(e) => patch({ linkedinUrl: e.target.value })}
                className="font-mono text-sm"
              />
            </Field>
            <Field label="GitHub URL">
              <Input
                value={site.githubUrl}
                onChange={(e) => patch({ githubUrl: e.target.value })}
                className="font-mono text-sm"
              />
            </Field>
          </div>
          <Field label="Footer line" hint="The sentence under the copyright.">
            <Textarea
              rows={2}
              value={site.footerTagline}
              onChange={(e) => patch({ footerTagline: e.target.value })}
            />
          </Field>
        </CardContent>
      </Card>

      {/* ---- section copy ---- */}
      <Card>
        <CardHeader>
          <CardTitle>Section headings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-xs text-slate-500">
            Each heading is split in two so the second half keeps the gradient — the same way the
            About section works.
          </p>

          <HeadingGroup
            title="Experience (home page)"
            heading={site.experienceHeading}
            accent={site.experienceHeadingAccent}
            subtitle={site.experienceSubtitle}
            onHeading={(v) => patch({ experienceHeading: v })}
            onAccent={(v) => patch({ experienceHeadingAccent: v })}
            onSubtitle={(v) => patch({ experienceSubtitle: v })}
          />

          <HeadingGroup
            title="Projects (/portfolio)"
            heading={site.projectsHeading}
            accent={site.projectsHeadingAccent}
            subtitle={site.projectsSubtitle}
            onHeading={(v) => patch({ projectsHeading: v })}
            onAccent={(v) => patch({ projectsHeadingAccent: v })}
            onSubtitle={(v) => patch({ projectsSubtitle: v })}
          />

          <HeadingGroup
            title="Blog (home page)"
            heading={site.blogHeading}
            accent={site.blogHeadingAccent}
            subtitle={site.blogSubtitle}
            onHeading={(v) => patch({ blogHeading: v })}
            onAccent={(v) => patch({ blogHeadingAccent: v })}
            onSubtitle={(v) => patch({ blogSubtitle: v })}
          />

          <HeadingGroup
            title="Blog (/blog)"
            heading={site.blogPageHeading}
            accent={site.blogPageHeadingAccent}
            subtitle={site.blogPageSubtitle}
            onHeading={(v) => patch({ blogPageHeading: v })}
            onAccent={(v) => patch({ blogPageHeadingAccent: v })}
            onSubtitle={(v) => patch({ blogPageSubtitle: v })}
          />

          <div className="space-y-3 rounded-lg border border-slate-700 bg-slate-800/40 p-4">
            <h3 className="text-sm font-semibold text-slate-200">
              Closing call to action (/portfolio)
            </h3>
            <Field label="Heading">
              <Input
                value={site.contactHeading}
                onChange={(e) => patch({ contactHeading: e.target.value })}
              />
            </Field>
            <Field label="Subtitle">
              <Input
                value={site.contactSubtitle}
                onChange={(e) => patch({ contactSubtitle: e.target.value })}
              />
            </Field>
          </div>
        </CardContent>
      </Card>

      {/* ---- SEO ---- */}
      <Card>
        <CardHeader>
          <CardTitle>Search and link previews</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field
            label="Meta title"
            hint="The browser tab and the search result heading. Blank falls back to the name and headline."
          >
            <Input value={site.metaTitle} onChange={(e) => patch({ metaTitle: e.target.value })} />
          </Field>
          <Field
            label="Meta description"
            hint="Around 155 characters. This is the grey text under the title in a search result, and the subtitle on a pasted link."
          >
            <Textarea
              rows={3}
              value={site.metaDescription}
              onChange={(e) => patch({ metaDescription: e.target.value })}
            />
          </Field>
          <Field label="Keywords" hint="Comma-separated.">
            <Input
              value={site.metaKeywords.join(', ')}
              onChange={(e) =>
                patch({
                  metaKeywords: e.target.value
                    .split(',')
                    .map((word) => word.trim())
                    .filter(Boolean),
                })
              }
            />
          </Field>
          <Field
            label="Preview image URL"
            hint="Shown when the link is pasted into LinkedIn, Slack or a message. Absolute URL."
          >
            <Input
              value={site.ogImageUrl}
              onChange={(e) => patch({ ogImageUrl: e.target.value })}
              className="font-mono text-sm"
            />
          </Field>
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

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-300">{label}</label>
      {children}
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

function HeadingGroup({
  title,
  heading,
  accent,
  subtitle,
  onHeading,
  onAccent,
  onSubtitle,
}: {
  title: string;
  heading: string;
  accent: string;
  subtitle: string;
  onHeading: (value: string) => void;
  onAccent: (value: string) => void;
  onSubtitle: (value: string) => void;
}) {
  return (
    <div className="space-y-3 rounded-lg border border-slate-700 bg-slate-800/40 p-4">
      <h3 className="text-sm font-semibold text-slate-200">{title}</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Heading">
          <Input value={heading} onChange={(e) => onHeading(e.target.value)} />
        </Field>
        <Field label="Accent word">
          <Input value={accent} onChange={(e) => onAccent(e.target.value)} />
        </Field>
      </div>
      <Field label="Subtitle">
        <Textarea rows={2} value={subtitle} onChange={(e) => onSubtitle(e.target.value)} />
      </Field>
    </div>
  );
}
