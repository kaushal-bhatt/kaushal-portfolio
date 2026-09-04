'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  TECH_COLOR_NAMES,
  TECH_ICON_NAMES,
  techColor,
  techIcon,
} from '@/lib/tech-visuals';

/**
 * The topics posts are filed under.
 *
 * This page exists because the post editor's topic field is now free text: an
 * unrecognised value creates its row with a default icon and colour, and
 * without somewhere to fix those, every new topic would be a grey document
 * icon forever — the same trap the About section's icon and colour keys were
 * built to avoid.
 *
 * Adding a topic is not offered here on purpose. A topic exists because a post
 * needed it; one created in advance is an empty filter on the blog page, which
 * is exactly the state the seed was cleaned up to remove.
 */

interface Topic {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  order: number;
  postCount: number;
}

export default function TopicsManagement() {
  const router = useRouter();

  const [topics, setTopics] = useState<Topic[] | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const load = async () => {
    try {
      const response = await fetch('/api/admin/tech-sections');
      if (response.ok) {
        setTopics(await response.json());
      } else {
        const body = await response.json().catch(() => ({}));
        setError(body.error ?? `Failed to load (HTTP ${response.status})`);
      }
    } catch (err) {
      console.error('Failed to load topics:', err);
      setError('Failed to load topics');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const patch = (id: string, changes: Partial<Topic>) => {
    setTopics((current) =>
      current?.map((topic) => (topic.id === id ? { ...topic, ...changes } : topic)) ?? null
    );
    setSuccess(null);
  };

  const save = async (topic: Topic) => {
    setBusyId(topic.id);
    setError(null);
    setSuccess(null);
    try {
      const response = await fetch(`/api/admin/tech-sections/${topic.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(topic),
      });
      if (response.ok) {
        setSuccess(`Saved “${topic.name}”.`);
      } else {
        const body = await response.json().catch(() => ({}));
        setError(body.error ?? 'Failed to save');
      }
    } catch (err) {
      console.error('Failed to save topic:', err);
      setError('Failed to save');
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (topic: Topic) => {
    if (!window.confirm(`Delete the topic “${topic.name}”?`)) return;

    setBusyId(topic.id);
    setError(null);
    setSuccess(null);
    try {
      const response = await fetch(`/api/admin/tech-sections/${topic.id}`, { method: 'DELETE' });
      if (response.ok) {
        setTopics((current) => current?.filter((row) => row.id !== topic.id) ?? null);
      } else {
        const body = await response.json().catch(() => ({}));
        setError(body.error ?? 'Failed to delete');
      }
    } catch (err) {
      console.error('Failed to delete topic:', err);
      setError('Failed to delete');
    } finally {
      setBusyId(null);
    }
  };

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
        <h1 className="text-2xl font-bold">Blog Topics</h1>
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

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-normal text-slate-400">
            Topics are created by writing a post, not here. Type anything into a post&rsquo;s Topic
            field and its row appears with a default icon — this is where you give it a real one.
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {topics === null && !error && <p className="text-slate-400">Loading…</p>}
          {topics?.length === 0 && (
            <p className="text-sm text-slate-500">No topics yet.</p>
          )}

          {topics?.map((topic) => (
            <div
              key={topic.id}
              className="space-y-3 rounded-lg border border-slate-700 bg-slate-800/40 p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{techIcon(topic.icon)}</span>
                  <span className={`font-semibold ${techColor(topic.color)}`}>{topic.name}</span>
                  <span className="font-mono text-xs text-slate-500">/{topic.slug}</span>
                  <span className="text-xs text-slate-500">
                    · {topic.postCount} post{topic.postCount === 1 ? '' : 's'}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Button size="sm" onClick={() => save(topic)} disabled={busyId === topic.id}>
                    <Save className="mr-2 h-4 w-4" />
                    Save
                  </Button>
                  {/*
                    Offered only for an empty topic. Posts reference a topic by
                    slug with no foreign key behind it, so deleting one that
                    still has posts would leave them filed under a value nothing
                    resolves — published, and invisible in every filter. The API
                    refuses it too; this just stops the button existing.
                  */}
                  {topic.postCount === 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(topic)}
                      disabled={busyId === topic.id}
                      className="text-red-400 hover:bg-red-500/10 hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-4">
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-slate-400">Name</label>
                  <Input
                    value={topic.name}
                    onChange={(e) => patch(topic.id, { name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-400">Icon</label>
                  <Select
                    value={topic.icon}
                    onValueChange={(value) => patch(topic.id, { icon: value })}
                  >
                    <SelectTrigger className="border-slate-600 bg-slate-800 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TECH_ICON_NAMES.map((name) => (
                        <SelectItem key={name} value={name}>
                          {techIcon(name)} {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-400">Colour</label>
                  <Select
                    value={TECH_COLOR_NAMES.includes(topic.color) ? topic.color : 'blue'}
                    onValueChange={(value) => patch(topic.id, { color: value })}
                  >
                    <SelectTrigger className="border-slate-600 bg-slate-800 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TECH_COLOR_NAMES.map((name) => (
                        <SelectItem key={name} value={name}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-400">
                  Description
                </label>
                <Input
                  value={topic.description}
                  onChange={(e) => patch(topic.id, { description: e.target.value })}
                  placeholder="Shown on the topic's own page"
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
