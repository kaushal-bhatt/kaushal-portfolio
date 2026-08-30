'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, Edit, Trash2, Save, X, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useRouter } from 'next/navigation';
import { stringToArray } from '@/lib/sqlite-helpers';
import {
  ABOUT_COLOR_NAMES,
  ABOUT_ICON_NAMES,
  aboutColor,
  aboutIcon,
} from '@/lib/about-visuals';

/**
 * The About section, which was three hardcoded arrays until now.
 *
 * One page rather than three because the parts are small and are always looked
 * at together — a skill card on its own screen would be a lot of navigation for
 * a list of four bullet points.
 */

interface AboutContent {
  heading: string;
  headingAccent: string;
  subtitle: string;
  journeyTitle: string;
  journey: string;
}

interface AboutSkill {
  id: string;
  category: string;
  icon: string;
  items: string[];
  color: string;
  order: number;
}

interface AboutStat {
  id: string;
  label: string;
  description: string;
  icon: string;
  order: number;
}

const NEW = 'new';

export default function AboutManagement() {
  const router = useRouter();

  const [content, setContent] = useState<AboutContent | null>(null);
  const [skills, setSkills] = useState<AboutSkill[]>([]);
  const [stats, setStats] = useState<AboutStat[]>([]);

  const [editingSkillId, setEditingSkillId] = useState<string | null>(null);
  const [skillForm, setSkillForm] = useState<Partial<AboutSkill>>({});
  const [editingStatId, setEditingStatId] = useState<string | null>(null);
  const [statForm, setStatForm] = useState<Partial<AboutStat>>({});

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const skillFormRef = useRef<HTMLDivElement>(null);
  const statFormRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchAbout();
  }, []);

  // Runs after the form has rendered — each editor sits above its list, so
  // opening it for a row near the bottom would otherwise happen off-screen and
  // look as though the click did nothing.
  useEffect(() => {
    if (editingSkillId) skillFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [editingSkillId]);

  useEffect(() => {
    if (editingStatId) statFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [editingStatId]);

  const fetchAbout = async () => {
    try {
      const response = await fetch('/api/admin/about');
      if (response.ok) {
        const data = await response.json();
        setContent(data.content);
        setSkills(data.skills);
        setStats(data.stats);
      } else {
        setError('Failed to fetch about content');
      }
    } catch (err) {
      console.error('Failed to fetch about content:', err);
      setError('Failed to fetch about content');
    }
  };

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  // ---- the prose block -----------------------------------------------------

  const saveContent = async () => {
    if (!content?.subtitle?.trim() || !content?.journey?.trim()) {
      setError('Subtitle and story are required');
      return;
    }

    setLoading(true);
    clearMessages();

    try {
      const response = await fetch('/api/admin/about', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(content),
      });

      if (response.ok) {
        setSuccess('About text saved.');
      } else {
        const body = await response.json();
        setError(body.error || 'Failed to save about text');
      }
    } catch (err) {
      console.error('Failed to save about text:', err);
      setError('Failed to save about text');
    } finally {
      setLoading(false);
    }
  };

  // ---- skill cards ---------------------------------------------------------

  const startCreateSkill = () => {
    setEditingSkillId(NEW);
    setSkillForm({
      category: '',
      icon: 'Code2',
      items: [],
      color: 'blue',
      order: skills.length + 1,
    });
    clearMessages();
  };

  const saveSkill = async () => {
    if (!skillForm.category?.trim()) {
      setError('Category is required');
      return;
    }

    setLoading(true);
    clearMessages();

    try {
      const isNew = editingSkillId === NEW;
      const response = await fetch(
        isNew ? '/api/admin/about/skills' : `/api/admin/about/skills/${editingSkillId}`,
        {
          method: isNew ? 'POST' : 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(skillForm),
        }
      );

      if (response.ok) {
        await fetchAbout();
        setEditingSkillId(null);
        setSkillForm({});
        setSuccess(isNew ? 'Skill card added.' : 'Skill card updated.');
      } else {
        const body = await response.json();
        setError(body.error || 'Failed to save skill card');
      }
    } catch (err) {
      console.error('Failed to save skill card:', err);
      setError('Failed to save skill card');
    } finally {
      setLoading(false);
    }
  };

  const deleteSkill = async (id: string, category: string) => {
    if (!confirm(`Delete the "${category}" card? This cannot be undone.`)) return;

    try {
      const response = await fetch(`/api/admin/about/skills/${id}`, { method: 'DELETE' });
      if (response.ok) {
        await fetchAbout();
        setSuccess('Skill card deleted.');
      } else {
        const body = await response.json();
        setError(body.error || 'Failed to delete skill card');
      }
    } catch (err) {
      console.error('Failed to delete skill card:', err);
      setError('Failed to delete skill card');
    }
  };

  // ---- the figures along the bottom ----------------------------------------

  const startCreateStat = () => {
    setEditingStatId(NEW);
    setStatForm({ label: '', description: '', icon: 'Award', order: stats.length + 1 });
    clearMessages();
  };

  const saveStat = async () => {
    if (!statForm.label?.trim() || !statForm.description?.trim()) {
      setError('Label and description are required');
      return;
    }

    setLoading(true);
    clearMessages();

    try {
      const isNew = editingStatId === NEW;
      const response = await fetch(
        isNew ? '/api/admin/about/stats' : `/api/admin/about/stats/${editingStatId}`,
        {
          method: isNew ? 'POST' : 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(statForm),
        }
      );

      if (response.ok) {
        await fetchAbout();
        setEditingStatId(null);
        setStatForm({});
        setSuccess(isNew ? 'Figure added.' : 'Figure updated.');
      } else {
        const body = await response.json();
        setError(body.error || 'Failed to save figure');
      }
    } catch (err) {
      console.error('Failed to save figure:', err);
      setError('Failed to save figure');
    } finally {
      setLoading(false);
    }
  };

  const deleteStat = async (id: string, label: string) => {
    if (!confirm(`Delete "${label}"? This cannot be undone.`)) return;

    try {
      const response = await fetch(`/api/admin/about/stats/${id}`, { method: 'DELETE' });
      if (response.ok) {
        await fetchAbout();
        setSuccess('Figure deleted.');
      } else {
        const body = await response.json();
        setError(body.error || 'Failed to delete figure');
      }
    } catch (err) {
      console.error('Failed to delete figure:', err);
      setError('Failed to delete figure');
    }
  };

  // Both editors offer the same list, so it is written once. The names are keys
  // into lib/about-visuals.ts — a free-text field here could name an icon that
  // does not exist in the bundle.
  const iconPicker = (value: string, onChange: (value: string) => void) => (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
        <SelectValue placeholder="Pick an icon…" />
      </SelectTrigger>
      <SelectContent>
        {ABOUT_ICON_NAMES.map((name) => {
          const Icon = aboutIcon(name);
          return (
            <SelectItem key={name} value={name}>
              <span className="flex items-center gap-2">
                <Icon className="w-4 h-4" />
                {name}
              </span>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );

  return (
    <div>
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/admin')}
            className="text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-2xl font-bold">About Section</h1>
        </div>

        {success && (
          <div className="bg-green-500/10 border border-green-500/40 text-green-300 px-4 py-3 rounded">
            {success}
          </div>
        )}
        {error && (
          <div className="bg-red-500/10 border border-red-500/40 text-red-300 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* ---- heading and story ---- */}
        <Card>
          <CardHeader>
            <CardTitle>Heading and story</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Heading</label>
                <Input
                  placeholder="About"
                  value={content?.heading ?? ''}
                  onChange={(e) =>
                    setContent({ ...(content as AboutContent), heading: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Accent word</label>
                <Input
                  placeholder="Me"
                  value={content?.headingAccent ?? ''}
                  onChange={(e) =>
                    setContent({ ...(content as AboutContent), headingAccent: e.target.value })
                  }
                />
                <p className="text-xs text-slate-500 mt-1">Rendered in the gradient.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Story heading
                </label>
                <Input
                  placeholder="My Journey"
                  value={content?.journeyTitle ?? ''}
                  onChange={(e) =>
                    setContent({ ...(content as AboutContent), journeyTitle: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Subtitle *</label>
              <Textarea
                rows={2}
                value={content?.subtitle ?? ''}
                onChange={(e) =>
                  setContent({ ...(content as AboutContent), subtitle: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Story *</label>
              <Textarea
                rows={14}
                className="font-mono text-sm"
                value={content?.journey ?? ''}
                onChange={(e) =>
                  setContent({ ...(content as AboutContent), journey: e.target.value })
                }
              />
              <p className="text-xs text-slate-500 mt-1">
                Markdown, the same subset blog posts use: a blank line between paragraphs,{' '}
                <code>**bold**</code>, and <code>[text](https://…)</code> for links. Raw HTML is
                escaped rather than rendered.
              </p>
            </div>

            <Button onClick={saveContent} disabled={loading}>
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Saving…' : 'Save text'}
            </Button>
          </CardContent>
        </Card>

        {/* ---- skill cards ---- */}
        <div className="flex items-center justify-between pt-4">
          <h2 className="text-xl font-semibold">Skill cards</h2>
          <Button onClick={startCreateSkill}>
            <Plus className="w-4 h-4 mr-2" />
            Add Skill Card
          </Button>
        </div>

        {editingSkillId && (
          <div ref={skillFormRef}>
            <Card>
              <CardHeader>
                <CardTitle>
                  {editingSkillId === NEW ? 'Add Skill Card' : 'Edit Skill Card'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Category *
                    </label>
                    <Input
                      placeholder="Cloud &amp; DevOps"
                      value={skillForm.category || ''}
                      onChange={(e) => setSkillForm({ ...skillForm, category: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Order</label>
                    <Input
                      type="number"
                      value={skillForm.order ?? 0}
                      onChange={(e) =>
                        setSkillForm({ ...skillForm, order: parseInt(e.target.value) || 0 })
                      }
                    />
                  </div>
                </div>

                <div>
                  {/* Joined for display, split on change — the column is String[]. */}
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Items (comma-separated)
                  </label>
                  <Input
                    placeholder="Docker, Kubernetes, Terraform"
                    value={(skillForm.items ?? []).join(', ')}
                    onChange={(e) =>
                      setSkillForm({ ...skillForm, items: stringToArray(e.target.value) })
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Icon</label>
                    {iconPicker(skillForm.icon || 'Code2', (icon) =>
                      setSkillForm({ ...skillForm, icon })
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Accent colour
                    </label>
                    <Select
                      value={skillForm.color || 'blue'}
                      onValueChange={(color) => setSkillForm({ ...skillForm, color })}
                    >
                      <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ABOUT_COLOR_NAMES.map((name) => (
                          <SelectItem key={name} value={name}>
                            <span className={`flex items-center gap-2 ${aboutColor(name)}`}>
                              ● {name}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={saveSkill} disabled={loading}>
                    <Save className="w-4 h-4 mr-2" />
                    {loading ? 'Saving…' : 'Save'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditingSkillId(null);
                      setSkillForm({});
                      clearMessages();
                    }}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid gap-4">
          {skills.map((skill) => {
            const Icon = aboutIcon(skill.icon);
            return (
              <Card key={skill.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className={`w-5 h-5 ${aboutColor(skill.color)}`} />
                        <h3 className="text-lg font-semibold">{skill.category}</h3>
                        <span className="text-xs text-slate-500">order {skill.order}</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {skill.items.map((item) => (
                          <Badge key={item} variant="secondary" className="text-xs">
                            {item}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingSkillId(skill.id);
                          setSkillForm(skill);
                          clearMessages();
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteSkill(skill.id, skill.category)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* ---- figures ---- */}
        <div className="flex items-center justify-between pt-4">
          <div>
            <h2 className="text-xl font-semibold">Figures</h2>
            <p className="text-sm text-slate-500">
              The row along the bottom. Four fill the grid exactly.
            </p>
          </div>
          <Button onClick={startCreateStat}>
            <Plus className="w-4 h-4 mr-2" />
            Add Figure
          </Button>
        </div>

        {editingStatId && (
          <div ref={statFormRef}>
            <Card>
              <CardHeader>
                <CardTitle>{editingStatId === NEW ? 'Add Figure' : 'Edit Figure'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Label *</label>
                    <Input
                      placeholder="7 Years"
                      value={statForm.label || ''}
                      onChange={(e) => setStatForm({ ...statForm, label: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Description *
                    </label>
                    <Input
                      placeholder="Building Backends"
                      value={statForm.description || ''}
                      onChange={(e) => setStatForm({ ...statForm, description: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Icon</label>
                    {iconPicker(statForm.icon || 'Award', (icon) =>
                      setStatForm({ ...statForm, icon })
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Order</label>
                    <Input
                      type="number"
                      value={statForm.order ?? 0}
                      onChange={(e) =>
                        setStatForm({ ...statForm, order: parseInt(e.target.value) || 0 })
                      }
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={saveStat} disabled={loading}>
                    <Save className="w-4 h-4 mr-2" />
                    {loading ? 'Saving…' : 'Save'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditingStatId(null);
                      setStatForm({});
                      clearMessages();
                    }}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          {stats.map((stat) => {
            const Icon = aboutIcon(stat.icon);
            return (
              <Card key={stat.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5 text-blue-400" />
                      <div>
                        <h3 className="text-lg font-semibold">{stat.label}</h3>
                        <p className="text-sm text-slate-400">{stat.description}</p>
                        <span className="text-xs text-slate-500">order {stat.order}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingStatId(stat.id);
                          setStatForm(stat);
                          clearMessages();
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteStat(stat.id, stat.label)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
