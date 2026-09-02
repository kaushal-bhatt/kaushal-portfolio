'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Copy,
  Eye,
  EyeOff,
  ExternalLink,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { ResumeMeta } from '@/lib/resume';

/**
 * Every version of the CV, published or not.
 *
 * Unpublished rows are the history. A CV is edited by replacing it, and the
 * version being replaced is exactly the one wanted back when the next
 * application goes badly — so the way to change this one is Duplicate, edit the
 * copy, publish the copy, unpublish the original. Nothing is ever lost and the
 * public site only ever shows what is deliberately live.
 */
export default function ResumeList() {
  const router = useRouter();

  const [resumes, setResumes] = useState<ResumeMeta[] | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      const response = await fetch('/api/admin/resume');
      if (response.ok) {
        setResumes(await response.json());
      } else {
        // The server's reason, not a generic string. The first time this fired
        // it was a missing column, and "Failed to load résumés" sent the reader
        // looking for deleted rows instead of an unapplied migration.
        const body = await response.json().catch(() => ({}));
        setError(body.error ?? `Failed to load résumés (HTTP ${response.status})`);
      }
    } catch (err) {
      console.error('Failed to load résumés:', err);
      setError('Failed to load résumés — the request did not complete.');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const togglePublished = async (resume: ResumeMeta) => {
    setBusyId(resume.id);
    setError(null);
    try {
      const response = await fetch(`/api/admin/resume/${resume.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: !resume.published }),
      });
      if (response.ok) {
        setResumes(
          (current) =>
            current?.map((row) =>
              row.id === resume.id ? { ...row, published: !resume.published } : row
            ) ?? null
        );
      } else {
        const body = await response.json().catch(() => ({}));
        setError(body.error ?? 'Failed to change this');
      }
    } catch (err) {
      console.error('Failed to change publish state:', err);
      setError('Failed to change this');
    } finally {
      setBusyId(null);
    }
  };

  const create = async (from?: string) => {
    setBusyId(from ?? 'new');
    setError(null);
    try {
      const response = await fetch('/api/admin/resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(from ? { from } : {}),
      });
      if (response.ok) {
        const { id } = await response.json();
        // Straight into the editor: a copy called "… (copy)" is not something
        // anyone wants to leave sitting in the list.
        router.push(`/admin/resume/${id}`);
      } else {
        const body = await response.json().catch(() => ({}));
        setError(body.error ?? 'Failed to create');
      }
    } catch (err) {
      console.error('Failed to create a résumé:', err);
      setError('Failed to create');
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (resume: ResumeMeta) => {
    // The one destructive action here, and the only one this page confirms:
    // unlike the editor, this writes immediately and there is no history behind
    // the history.
    if (
      !window.confirm(
        `Delete "${resume.label}" permanently? Unpublishing keeps it and takes it off the site.`
      )
    ) {
      return;
    }

    setBusyId(resume.id);
    setError(null);
    try {
      const response = await fetch(`/api/admin/resume/${resume.id}`, { method: 'DELETE' });
      if (response.ok) {
        setResumes((current) => current?.filter((row) => row.id !== resume.id) ?? null);
      } else {
        setError('Failed to delete');
      }
    } catch (err) {
      console.error('Failed to delete the résumé:', err);
      setError('Failed to delete');
    } finally {
      setBusyId(null);
    }
  };

  const publishedCount = resumes?.filter((row) => row.published).length ?? 0;

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div className="flex flex-wrap items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => router.push('/admin')}
          className="text-slate-400 hover:text-white"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
        <h1 className="text-2xl font-bold">Résumés</h1>
        <div className="ml-auto">
          <Button onClick={() => create()} disabled={busyId === 'new'}>
            <Plus className="mr-2 h-4 w-4" />
            New résumé
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded border border-red-500/40 bg-red-500/10 px-4 py-3 text-red-300">
          {error}
        </div>
      )}

      <Card>
        {/*
          Only once the list has actually arrived. `publishedCount` is 0 while
          `resumes` is null too, so this used to announce that nothing was
          published during the load — and, worse, next to a failure, where it
          read as a statement about the data rather than about not having any.
        */}
        {resumes !== null && (
          <CardHeader>
            <CardTitle className="text-base font-normal text-slate-400">
              {publishedCount === 0 ? (
                <>
                  Nothing is published, so the résumé link is hidden everywhere on the site — the
                  navigation, the hero, the About band and the footer.
                </>
              ) : (
                <>
                  {publishedCount} published. A bare{' '}
                  <code className="text-slate-300">/resume</code> lands on the one with the lowest
                  order; the About band shows a button for each.
                </>
              )}
            </CardTitle>
          </CardHeader>
        )}
        <CardContent className="space-y-3 pt-6">
          {resumes === null && !error && <p className="text-slate-400">Loading…</p>}

          {resumes?.length === 0 && (
            <p className="text-sm text-slate-500">
              None yet. &ldquo;New résumé&rdquo; starts a blank one.
            </p>
          )}

          {resumes?.map((resume) => (
            <div
              key={resume.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-slate-700 bg-slate-800/40 p-4"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="truncate font-semibold text-slate-100">{resume.label}</h3>
                  <Badge
                    variant={resume.published ? 'secondary' : 'outline'}
                    className={
                      resume.published
                        ? 'bg-green-600/20 text-green-400'
                        : 'border-yellow-600/30 text-yellow-400'
                    }
                  >
                    {resume.published ? 'Published' : 'Draft'}
                  </Badge>
                </div>
                <p className="mt-1 font-mono text-xs text-slate-500">
                  /resume/{resume.slug} · order {resume.order} · edited{' '}
                  {new Date(resume.updatedAt).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
              </div>

              <div className="flex flex-shrink-0 items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => togglePublished(resume)}
                  disabled={busyId === resume.id}
                  title={
                    resume.published
                      ? 'Unpublish — keeps it, removes every link to it from the site'
                      : 'Publish — the link comes back on the site'
                  }
                  className={resume.published ? 'text-green-400' : 'text-yellow-400'}
                >
                  {resume.published ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4" />
                  )}
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push(`/admin/resume/${resume.id}`)}
                  title="Edit"
                >
                  <Pencil className="h-4 w-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => create(resume.id)}
                  disabled={busyId === resume.id}
                  title="Duplicate — edit the copy and leave this one alone"
                >
                  <Copy className="h-4 w-4" />
                </Button>

                {/*
                  Only offered for a published résumé: the public page 404s an
                  unpublished one, so this would be a button that always looks
                  broken. Preview a draft by publishing it, or read it in the
                  editor.
                */}
                {resume.published && (
                  <Button variant="ghost" size="sm" asChild title="View the live page">
                    <a href={`/resume/${resume.slug}`} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(resume)}
                  disabled={busyId === resume.id}
                  title="Delete permanently"
                  className="text-red-400 hover:bg-red-500/10 hover:text-red-300"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
