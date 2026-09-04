'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';

// Fetched, not hardcoded — see the note in app/admin/posts/[id]/page.tsx. The
// list that was here stored display names while posts store slugs, so a post
// created through this form landed in a category the blog could never match.
interface TechOption {
  name: string;
  slug: string;
}

interface BlogPostForm {
  title: string;
  excerpt: string;
  content: string;
  technology: string;
  ogImageUrl: string;
  published: boolean;
}

export default function NewPost() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [technologies, setTechnologies] = useState<TechOption[]>([]);
  const [formData, setFormData] = useState<BlogPostForm>({
    title: '',
    excerpt: '',
    content: '',
    technology: '',
    ogImageUrl: '',
    published: false
  });


  useEffect(() => {
    fetch('/api/tech-sections')
      .then((res) => (res.ok ? res.json() : []))
      .then((data: TechOption[]) => setTechnologies(data))
      .catch(() => setTechnologies([]));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.content || !formData.technology) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await fetch('/api/blog-posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await response.json();
        
        if (formData.published) {
          setSuccess('Post published successfully!');
        } else {
          setSuccess('Draft saved successfully!');
        }
        
        // Redirect to manage posts after a short delay
        setTimeout(() => {
          router.push('/admin/posts');
        }, 2000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to create post');
      }
    } catch (error) {
      console.error('Failed to create post:', error);
      setError('Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    const draftData = { ...formData, published: false };
    setFormData(draftData);
    
    if (!draftData.title) {
      setError('Please provide at least a title to save as draft');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await fetch('/api/blog-posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(draftData),
      });

      if (response.ok) {
        setSuccess('Draft saved successfully!');
        
        // Redirect to manage posts after a short delay
        setTimeout(() => {
          router.push('/admin/posts');
        }, 1500);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to save draft');
      }
    } catch (error) {
      console.error('Failed to save draft:', error);
      setError('Failed to save draft');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => router.push('/admin/posts')}
                className="text-gray-300 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Posts
              </Button>
              <h1 className="text-xl font-bold gradient-text">Create New Post</h1>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={handleSaveDraft}
                disabled={loading}
                className="border-slate-600 text-slate-300 hover:bg-slate-800"
              >
                Save Draft
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Save className="w-4 h-4 mr-2" />
                {formData.published ? 'Publish' : 'Create'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success/Error Messages */}
        {success && (
          <div className="bg-green-600/20 border border-green-600/30 text-green-400 px-4 py-3 rounded mb-6">
            {success}
          </div>
        )}
        {error && (
          <div className="bg-red-600/20 border border-red-600/30 text-red-400 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <Card className="glass-effect border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title" className="text-white">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter post title..."
                    className="bg-slate-800 border-slate-600 text-white"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="technology" className="text-white">Topic *</Label>
                  {/*
                    Free text with suggestions, not a dropdown.

                    It was a Select over whatever rows happened to be in
                    TechSection, and there was no admin UI for that table — so
                    writing about anything outside the four seeded topics meant
                    a code change. On an empty table the list was empty and no
                    post could be created at all.

                    A `datalist` keeps the existing topics one keystroke away
                    while allowing anything else. The API creates the row for an
                    unrecognised value, matching on the slug so "Spring Boot"
                    finds `spring-boot` rather than making a near-duplicate.
                  */}
                  <Input
                    id="technology"
                    list="technology-options"
                    value={formData.technology}
                    onChange={(e) => setFormData({ ...formData, technology: e.target.value })}
                    placeholder="e.g. AI, Java, System Design…"
                    className="bg-slate-800 border-slate-600 text-white"
                    required
                  />
                  <datalist id="technology-options">
                    {technologies.map((tech) => (
                      <option key={tech.slug} value={tech.name} />
                    ))}
                  </datalist>
                  <p className="mt-1 text-xs text-slate-500">
                    Anything goes. A topic that does not exist yet is created when the post is
                    saved; tidy up its icon and colour in Blog Topics.
                  </p>
                </div>

                <div>
                  <Label htmlFor="excerpt" className="text-white">Excerpt</Label>
                  <Textarea
                    id="excerpt"
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    placeholder="Brief description of the post..."
                    className="bg-slate-800 border-slate-600 text-white resize-none"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="ogImageUrl" className="text-white">
                    Preview image URL
                  </Label>
                  <Input
                    id="ogImageUrl"
                    value={formData.ogImageUrl}
                    onChange={(e) => setFormData({ ...formData, ogImageUrl: e.target.value })}
                    placeholder="Leave blank — one is generated from the title"
                    className="bg-slate-800 border-slate-600 text-white font-mono text-sm"
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    Optional. Leave it blank and the card people see when this link is pasted
                    into LinkedIn or a message is drawn from the title and topic automatically.
                    Fill it in only when a specific diagram or screenshot says more than the
                    title does — it has to be a URL, since there is nowhere here to upload a
                    file to.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Content */}
            <Card className="glass-effect border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Content *</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Write your blog post content here... (Supports Markdown)"
                  className="bg-slate-800 border-slate-600 text-white resize-none"
                  rows={20}
                  required
                />
                <p className="text-sm text-gray-400 mt-2">
                  Tip: You can use Markdown formatting for rich text content.
                </p>
              </CardContent>
            </Card>

            {/* Publishing Options */}
            <Card className="glass-effect border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Publishing Options</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="published"
                    checked={formData.published}
                    onCheckedChange={(checked) => setFormData({ ...formData, published: checked })}
                  />
                  <Label htmlFor="published" className="text-white">
                    Publish immediately
                  </Label>
                </div>
                <p className="text-sm text-gray-400 mt-2">
                  {formData.published 
                    ? 'This post will be published and visible to visitors' 
                    : 'This post will be saved as a draft'
                  }
                </p>
              </CardContent>
            </Card>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
