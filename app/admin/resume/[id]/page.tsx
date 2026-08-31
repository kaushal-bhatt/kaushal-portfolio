'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, ArrowDown, ArrowUp, ExternalLink, Plus, Save, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type {
  ResumeEducation,
  ResumeExperience,
  ResumeProject,
  ResumeRecord,
  ResumeSkillGroup,
} from '@/lib/resume';

/**
 * One résumé.
 *
 * One Save for the whole document, because it is one row and is read as one
 * thing — a per-section write would let the CV end up half-updated in a way the
 * form cannot show. Nothing is written until Save is pressed, which is what
 * makes the beforeunload guard below real rather than decorative, and why
 * removing a row asks for no confirmation: leaving the page undoes it.
 *
 * Repeated blocks are edited as lists with move and remove controls rather than
 * as separate screens. Reordering jobs is the edit most often wanted, and it is
 * the one a row-per-page editor makes hardest.
 */

type ListKey = 'skills' | 'experience' | 'projects' | 'education';

const EMPTY_SKILL: ResumeSkillGroup = { label: '', items: '' };
const EMPTY_EXPERIENCE: ResumeExperience = {
  company: '',
  role: '',
  period: '',
  location: '',
  context: '',
  bullets: [''],
};
const EMPTY_PROJECT: ResumeProject = { name: '', tagline: '', liveUrl: '', repoUrl: '' };
const EMPTY_EDUCATION: ResumeEducation = { degree: '', institution: '', location: '', period: '' };

function move<T>(list: T[], from: number, to: number): T[] {
  if (to < 0 || to >= list.length) return list;
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export default function ResumeEditor() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [resume, setResume] = useState<ResumeRecord | null>(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const response = await fetch(`/api/admin/resume/${id}`);
        if (response.ok) {
          setResume(await response.json());
        } else {
          setError('Failed to load this résumé');
        }
      } catch (err) {
        console.error('Failed to load the résumé:', err);
        setError('Failed to load this résumé');
      }
    };
    load();
  }, [id]);

  // Nothing is saved until Save is pressed, and this form holds a lot of
  // typing. The browser shows its own wording; the string is only required.
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const patch = useCallback((changes: Partial<ResumeRecord>) => {
    setResume((current) => (current ? { ...current, ...changes } : current));
    setDirty(true);
    setSuccess(null);
  }, []);

  const setList = useCallback(
    <K extends ListKey>(key: K, next: ResumeRecord[K]) => {
      patch({ [key]: next } as unknown as Partial<ResumeRecord>);
    },
    [patch]
  );

  /**
   * The same figure the two-page budget is spent against. Shown live because
   * the thing that pushes this document onto a third page is always one more
   * bullet point, and there is no other moment at which anyone notices.
   */
  const wordCount = useMemo(() => {
    if (!resume) return 0;
    return [
      resume.summary,
      ...resume.experience.flatMap((job) => [
        job.company,
        job.role,
        job.context ?? '',
        ...job.bullets,
      ]),
      ...resume.skills.map((group) => `${group.label} ${group.items}`),
      ...resume.projects.map((project) => `${project.name} ${project.tagline}`),
      resume.certifications,
      resume.languages,
    ]
      .join(' ')
      .split(/\s+/)
      .filter(Boolean).length;
  }, [resume]);

  const save = async () => {
    if (!resume) return;
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/admin/resume/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resume),
      });

      if (response.ok) {
        // The response is the record as stored, which is not quite what was
        // sent: blank rows and stray whitespace are gone, and the slug may have
        // been made unique. Taking it back means the form shows what the public
        // page will actually render, at the address it will render from.
        setResume(await response.json());
        setDirty(false);
        setSuccess('Saved.');
      } else {
        const body = await response.json().catch(() => ({}));
        setError(body.error ?? 'Failed to save');
      }
    } catch (err) {
      console.error('Failed to save the résumé:', err);
      setError('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (!resume) {
    return (
      <div className="mx-auto max-w-5xl p-6">
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
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div className="flex flex-wrap items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => router.push('/admin/resume')}
          className="text-slate-400 hover:text-white"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          All résumés
        </Button>
        <h1 className="text-2xl font-bold">{resume.label || 'Résumé'}</h1>
      </div>

      {/* Sticky, because Save is the only thing that writes and the form is
          taller than a screen several times over. */}
      <div className="sticky top-0 z-10 -mx-6 flex flex-wrap items-center justify-between gap-3 border-b border-slate-700 bg-slate-900/95 px-6 py-3 backdrop-blur">
        <div className="text-sm text-slate-400">
          <span className={wordCount > 600 ? 'text-amber-400' : 'text-slate-300'}>
            {wordCount} words
          </span>
          <span className="text-slate-500"> · two pages is roughly 550–600</span>
          {dirty && <span className="ml-3 text-amber-400">Unsaved changes</span>}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild disabled={!resume.published}>
            <a href={`/resume/${resume.slug}`} target="_blank" rel="noopener noreferrer">
              Preview
              <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>
          <Button onClick={save} disabled={saving || !dirty}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </div>
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

      {/* ---- which version this is ---- */}
      <Card>
        <CardHeader>
          <CardTitle>This version</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Label *"
              hint="What tells this apart from the other versions, and the text on the button that links to it."
            >
              <Input value={resume.label} onChange={(e) => patch({ label: e.target.value })} />
            </Field>
            <Field label="Address" hint="Leave blank to follow the label. /resume/…">
              <Input
                value={resume.slug}
                onChange={(e) => patch({ slug: e.target.value })}
                className="font-mono text-sm"
              />
            </Field>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={resume.published}
                onChange={(e) => patch({ published: e.target.checked })}
                className="h-4 w-4 rounded border-slate-600 bg-slate-800"
              />
              Published
            </label>
            <div className="w-32">
              <Field label="Order">
                <Input
                  type="number"
                  value={resume.order}
                  onChange={(e) => patch({ order: Number(e.target.value) })}
                />
              </Field>
            </div>
          </div>
          <p className="text-xs text-slate-500">
            Unpublished means gone from the public site entirely — every link to it disappears and
            the address 404s. Lowest order wins when more than one is published: that is the one a
            bare <code>/resume</code> lands on.
          </p>
        </CardContent>
      </Card>

      {/* ---- header ---- */}
      <Card>
        <CardHeader>
          <CardTitle>Header</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name *">
              <Input value={resume.fullName} onChange={(e) => patch({ fullName: e.target.value })} />
            </Field>
            <Field label="Headline *">
              <Input value={resume.headline} onChange={(e) => patch({ headline: e.target.value })} />
            </Field>
          </div>
          <Field label="Location line">
            <Input value={resume.location} onChange={(e) => patch({ location: e.target.value })} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Email *">
              <Input value={resume.email} onChange={(e) => patch({ email: e.target.value })} />
            </Field>
            <Field
              label="Phone"
              hint="Printed copy only — it is left off the public page on purpose. Blank drops it from the PDF too."
            >
              <Input value={resume.phone} onChange={(e) => patch({ phone: e.target.value })} />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="LinkedIn">
              <Input value={resume.linkedin} onChange={(e) => patch({ linkedin: e.target.value })} />
            </Field>
            <Field label="GitHub">
              <Input value={resume.github} onChange={(e) => patch({ github: e.target.value })} />
            </Field>
            <Field label="Website">
              <Input value={resume.website} onChange={(e) => patch({ website: e.target.value })} />
            </Field>
          </div>
          <p className="text-xs text-slate-500">
            The three above are shown without their scheme and linked with one — write them as{' '}
            <code>linkedin.com/in/…</code>, not <code>https://…</code>.
          </p>
        </CardContent>
      </Card>

      {/* ---- summary ---- */}
      <Card>
        <CardHeader>
          <CardTitle>Professional Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <Field
            label="Summary *"
            hint="Around fifty words. The ATS reads this first, and so does a human."
          >
            <Textarea
              rows={4}
              value={resume.summary}
              onChange={(e) => patch({ summary: e.target.value })}
            />
          </Field>
        </CardContent>
      </Card>

      {/* ---- experience ---- */}
      <ListCard
        title="Professional Experience"
        count={resume.experience.length}
        onAdd={() => setList('experience', [...resume.experience, { ...EMPTY_EXPERIENCE }])}
        addLabel="Add a role"
      >
        {resume.experience.map((job, index) => {
          const update = (changes: Partial<ResumeExperience>) =>
            setList(
              'experience',
              resume.experience.map((item, i) => (i === index ? { ...item, ...changes } : item))
            );

          return (
            <Row
              key={index}
              title={job.company || 'New role'}
              index={index}
              count={resume.experience.length}
              onMove={(to) => setList('experience', move(resume.experience, index, to))}
              onRemove={() =>
                setList(
                  'experience',
                  resume.experience.filter((_, i) => i !== index)
                )
              }
            >
              <div className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Company">
                    <Input value={job.company} onChange={(e) => update({ company: e.target.value })} />
                  </Field>
                  <Field label="Role">
                    <Input value={job.role} onChange={(e) => update({ role: e.target.value })} />
                  </Field>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Period" hint="e.g. Dec 2024 – Present">
                    <Input value={job.period} onChange={(e) => update({ period: e.target.value })} />
                  </Field>
                  <Field label="Location">
                    <Input
                      value={job.location}
                      onChange={(e) => update({ location: e.target.value })}
                    />
                  </Field>
                </div>
                <Field
                  label="Context"
                  hint="Optional italic line under the role — the stack, or what the product is."
                >
                  <Input
                    value={job.context ?? ''}
                    onChange={(e) => update({ context: e.target.value })}
                  />
                </Field>
                <Field label="Bullets" hint="One per line. Lead with the result, then the tool.">
                  <Textarea
                    rows={Math.max(4, job.bullets.length + 1)}
                    className="font-mono text-sm"
                    value={job.bullets.join('\n')}
                    onChange={(e) => update({ bullets: e.target.value.split('\n') })}
                  />
                </Field>
              </div>
            </Row>
          );
        })}
      </ListCard>

      {/* ---- skills ---- */}
      <ListCard
        title="Technical Skills"
        count={resume.skills.length}
        onAdd={() => setList('skills', [...resume.skills, { ...EMPTY_SKILL }])}
        addLabel="Add a group"
      >
        {resume.skills.map((group, index) => {
          const update = (changes: Partial<ResumeSkillGroup>) =>
            setList(
              'skills',
              resume.skills.map((item, i) => (i === index ? { ...item, ...changes } : item))
            );

          return (
            <Row
              key={index}
              title={group.label || 'New group'}
              index={index}
              count={resume.skills.length}
              onMove={(to) => setList('skills', move(resume.skills, index, to))}
              onRemove={() =>
                setList(
                  'skills',
                  resume.skills.filter((_, i) => i !== index)
                )
              }
            >
              <div className="space-y-3">
                <Field label="Label" hint="e.g. Languages & Frameworks">
                  <Input value={group.label} onChange={(e) => update({ label: e.target.value })} />
                </Field>
                <Field
                  label="Items"
                  hint="One comma-separated line. This is what an ATS parses cleanly."
                >
                  <Textarea
                    rows={2}
                    value={group.items}
                    onChange={(e) => update({ items: e.target.value })}
                  />
                </Field>
              </div>
            </Row>
          );
        })}
      </ListCard>

      {/* ---- projects ---- */}
      <ListCard
        title="Projects"
        count={resume.projects.length}
        onAdd={() => setList('projects', [...resume.projects, { ...EMPTY_PROJECT }])}
        addLabel="Add a project"
      >
        {resume.projects.map((project, index) => {
          const update = (changes: Partial<ResumeProject>) =>
            setList(
              'projects',
              resume.projects.map((item, i) => (i === index ? { ...item, ...changes } : item))
            );

          return (
            <Row
              key={index}
              title={project.name || 'New project'}
              index={index}
              count={resume.projects.length}
              onMove={(to) => setList('projects', move(resume.projects, index, to))}
              onRemove={() =>
                setList(
                  'projects',
                  resume.projects.filter((_, i) => i !== index)
                )
              }
            >
              <div className="space-y-3">
                <Field label="Name">
                  <Input value={project.name} onChange={(e) => update({ name: e.target.value })} />
                </Field>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Live URL" hint="Optional. Full https:// URL.">
                    <Input
                      value={project.liveUrl ?? ''}
                      onChange={(e) => update({ liveUrl: e.target.value })}
                    />
                  </Field>
                  <Field label="Repository URL" hint="Required — a project with no link is a claim.">
                    <Input
                      value={project.repoUrl}
                      onChange={(e) => update({ repoUrl: e.target.value })}
                    />
                  </Field>
                </div>
                <Field label="One-line description">
                  <Textarea
                    rows={2}
                    value={project.tagline}
                    onChange={(e) => update({ tagline: e.target.value })}
                  />
                </Field>
              </div>
            </Row>
          );
        })}
      </ListCard>

      {/* ---- education ---- */}
      <ListCard
        title="Education"
        count={resume.education.length}
        onAdd={() => setList('education', [...resume.education, { ...EMPTY_EDUCATION }])}
        addLabel="Add an entry"
      >
        {resume.education.map((entry, index) => {
          const update = (changes: Partial<ResumeEducation>) =>
            setList(
              'education',
              resume.education.map((item, i) => (i === index ? { ...item, ...changes } : item))
            );

          return (
            <Row
              key={index}
              title={entry.degree || 'New entry'}
              index={index}
              count={resume.education.length}
              onMove={(to) => setList('education', move(resume.education, index, to))}
              onRemove={() =>
                setList(
                  'education',
                  resume.education.filter((_, i) => i !== index)
                )
              }
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Degree">
                  <Input value={entry.degree} onChange={(e) => update({ degree: e.target.value })} />
                </Field>
                <Field label="Institution">
                  <Input
                    value={entry.institution}
                    onChange={(e) => update({ institution: e.target.value })}
                  />
                </Field>
                <Field label="Location">
                  <Input
                    value={entry.location}
                    onChange={(e) => update({ location: e.target.value })}
                  />
                </Field>
                <Field label="Period">
                  <Input value={entry.period} onChange={(e) => update({ period: e.target.value })} />
                </Field>
              </div>
            </Row>
          );
        })}
      </ListCard>

      {/* ---- the two closing lines ---- */}
      <Card>
        <CardHeader>
          <CardTitle>Certifications and languages</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field
            label="Certifications & Training"
            hint="One line, separated by · — the compressed style."
          >
            <Textarea
              rows={2}
              value={resume.certifications}
              onChange={(e) => patch({ certifications: e.target.value })}
            />
          </Field>
          <Field label="Languages">
            <Textarea
              rows={2}
              value={resume.languages}
              onChange={(e) => patch({ languages: e.target.value })}
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

function ListCard({
  title,
  count,
  addLabel,
  onAdd,
  children,
}: {
  title: string;
  count: number;
  addLabel: string;
  onAdd: () => void;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>
          {title} <span className="text-sm font-normal text-slate-500">({count})</span>
        </CardTitle>
        <Button variant="outline" size="sm" onClick={onAdd}>
          <Plus className="mr-2 h-4 w-4" />
          {addLabel}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {count === 0 ? (
          <p className="text-sm text-slate-500">
            Nothing here yet — this section is left out of the document entirely.
          </p>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}

/** The move and remove chrome around one entry in a list. */
function Row({
  title,
  index,
  count,
  onMove,
  onRemove,
  children,
}: {
  title: string;
  index: number;
  count: number;
  onMove: (to: number) => void;
  onRemove: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-800/40 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="truncate text-sm font-semibold text-slate-200">
          <span className="mr-2 text-slate-500">{index + 1}.</span>
          {title}
        </h3>
        <div className="flex flex-shrink-0 items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            aria-label="Move up"
            disabled={index === 0}
            onClick={() => onMove(index - 1)}
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            aria-label="Move down"
            disabled={index === count - 1}
            onClick={() => onMove(index + 1)}
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
          {/*
            No confirmation dialog: nothing is written until Save, so a removal
            is undone by leaving the page. A modal here would be asking about a
            change that has not happened.
          */}
          <Button
            variant="ghost"
            size="sm"
            aria-label="Remove"
            onClick={onRemove}
            className="text-red-400 hover:bg-red-500/10 hover:text-red-300"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      {children}
    </div>
  );
}
