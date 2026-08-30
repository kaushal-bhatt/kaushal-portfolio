'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, Edit, Trash2, Save, X, ArrowLeft, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { stringToArray } from '@/lib/sqlite-helpers';

interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  demoUrl: string | null;
  githubUrl: string;
  status: string;
  category: string;
  featured: boolean;
  completionDate: string;
  order: number;
}

export default function ProjectManagement() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Project>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  // Runs after the form has rendered — the editor sits above the list, so
  // opening it for a project near the bottom would otherwise happen off-screen
  // and look as though the click did nothing.
  useEffect(() => {
    if (editingId) {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [editingId]);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/admin/projects');
      if (response.ok) {
        setProjects(await response.json());
      } else {
        setError('Failed to fetch projects');
      }
    } catch (err) {
      console.error('Failed to fetch projects:', err);
      setError('Failed to fetch projects');
    }
  };

  const handleEdit = (project: Project) => {
    setEditingId(project.id);
    setFormData(project);
    setError(null);
    setSuccess(null);
  };

  const startCreate = () => {
    setEditingId('new');
    setFormData({
      title: '',
      description: '',
      technologies: [],
      demoUrl: '',
      githubUrl: '',
      status: 'Open Source',
      category: '',
      featured: false,
      completionDate: '',
      order: projects.length + 1,
    });
    setError(null);
    setSuccess(null);
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({});
    setError(null);
    setSuccess(null);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.description || !formData.githubUrl || !formData.category) {
      setError('Title, description, GitHub URL and category are required');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const url = editingId === 'new' ? '/api/admin/projects' : `/api/admin/projects/${editingId}`;
      const response = await fetch(url, {
        method: editingId === 'new' ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchProjects();
        setEditingId(null);
        setFormData({});
        setSuccess(editingId === 'new' ? 'Project added.' : 'Project updated.');
      } else {
        const body = await response.json();
        setError(body.error || 'Failed to save project');
      }
    } catch (err) {
      console.error('Failed to save project:', err);
      setError('Failed to save project');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;

    try {
      const response = await fetch(`/api/admin/projects/${id}`, { method: 'DELETE' });
      if (response.ok) {
        await fetchProjects();
        setSuccess('Project deleted.');
      } else {
        const body = await response.json();
        setError(body.error || 'Failed to delete project');
      }
    } catch (err) {
      console.error('Failed to delete project:', err);
      setError('Failed to delete project');
    }
  };

  return (
    <div>
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => router.push('/admin')}
              className="text-slate-400 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-2xl font-bold">Projects</h1>
          </div>
          <Button onClick={startCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Add Project
          </Button>
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

        {editingId && (
          <div ref={formRef}>
            <Card>
              <CardHeader>
                <CardTitle>{editingId === 'new' ? 'Add Project' : 'Edit Project'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Title *</label>
                    <Input
                      value={formData.title || ''}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Category *</label>
                    <Input
                      placeholder="Security, Data Engineering, …"
                      value={formData.category || ''}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Description *</label>
                  <Textarea
                    rows={4}
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div>
                  {/* Joined for display, split on change — the column is String[]. */}
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Technologies (comma-separated)
                  </label>
                  <Input
                    value={(formData.technologies ?? []).join(', ')}
                    onChange={(e) =>
                      setFormData({ ...formData, technologies: stringToArray(e.target.value) })
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">GitHub URL *</label>
                    <Input
                      placeholder="https://github.com/…"
                      value={formData.githubUrl || ''}
                      onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Live demo URL
                    </label>
                    <Input
                      placeholder="Leave empty if there is none"
                      value={formData.demoUrl || ''}
                      onChange={(e) => setFormData({ ...formData, demoUrl: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Status</label>
                    <Input
                      placeholder="Open Source"
                      value={formData.status || ''}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Completion (YYYY-MM)
                    </label>
                    <Input
                      placeholder="2026-08"
                      value={formData.completionDate || ''}
                      onChange={(e) => setFormData({ ...formData, completionDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Order</label>
                    <Input
                      type="number"
                      value={formData.order ?? 0}
                      onChange={(e) =>
                        setFormData({ ...formData, order: parseInt(e.target.value) || 0 })
                      }
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Switch
                    id="featured"
                    checked={formData.featured || false}
                    onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
                  />
                  <Label htmlFor="featured" className="text-slate-300">
                    Featured — shown in the larger grid above the rest
                  </Label>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleSave} disabled={loading}>
                    <Save className="w-4 h-4 mr-2" />
                    {loading ? 'Saving…' : 'Save'}
                  </Button>
                  <Button variant="outline" onClick={handleCancel}>
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid gap-4">
          {projects.map((project) => (
            <Card key={project.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold">{project.title}</h3>
                      {project.featured && (
                        <Star className="w-4 h-4 text-yellow-400" aria-label="Featured" />
                      )}
                      <Badge variant="outline" className="text-xs">
                        {project.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-400 mb-3">{project.description}</p>

                    {project.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {project.technologies.map((tech) => (
                          <Badge key={tech} variant="secondary" className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                      <span>{project.status}</span>
                      {project.completionDate && <span>{project.completionDate}</span>}
                      <span>order {project.order}</span>
                      {project.demoUrl ? <span>has demo</span> : <span>no demo</span>}
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(project)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(project.id, project.title)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
