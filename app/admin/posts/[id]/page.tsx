'use client';

import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Eye, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const TECHNOLOGIES = [
  'Java', 'Spring Boot', 'React', 'Next.js', 'TypeScript', 'JavaScript',
  'Python', 'Node.js', 'AWS', 'Docker', 'Kubernetes', 'PostgreSQL',
  'MongoDB', 'Redis', 'Kafka', 'Microservices', 'GraphQL', 'REST API'
];

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  technology: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function EditPost() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [post, setPost] = useState<BlogPost | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session?.user || session.user.role !== 'admin') {
      router.push('/auth/signin');
      return;
    }

    if (params.id) {
      fetchPost();
    }
  }, [session, status, router, params.id]);

  const fetchPost = async () => {
    try {
      const response = await fetch(`/api/blog-posts?id=${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setPost(data);
      } else {
        setError('Post not found');
        setTimeout(() => router.push('/admin/posts'), 2000);
      }
    } catch (error) {
      console.error('Failed to fetch post:', error);
      setError('Failed to fetch post');
      setTimeout(() => router.push('/admin/posts'), 2000);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!post || !post.title || !post.content || !post.technology) {
      setError('Please fill in all required fields');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await fetch('/api/blog-posts', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(post),
      });

      if (response.ok) {
        const updatedPost = await response.json();
        setPost(updatedPost);
        setSuccess('Post updated successfully!');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to update post');
      }
    } catch (error) {
      console.error('Failed to update post:', error);
      setError('Failed to update post');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!post) return;
    
    if (!confirm(`Are you sure you want to delete "${post.title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/blog-posts?id=${post.id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setSuccess('Post deleted successfully!');
        setTimeout(() => router.push('/admin/posts'), 1500);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to delete post');
      }
    } catch (error) {
      console.error('Failed to delete post:', error);
      setError('Failed to delete post');
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session?.user || session.user.role !== 'admin') {
    return null;
  }

  if (error && !post) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">Error</h1>
          <p className="text-red-400 mb-4">{error}</p>
          <Button onClick={() => router.push('/admin/posts')}>
            Back to Posts
          </Button>
        </div>
      </div>
    );
  }

  if (!post) {
    return null;
  }

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
              <h1 className="text-xl font-bold gradient-text">Edit Post</h1>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={() => window.open(`/blog/post/${post.slug}`, '_blank')}
                className="border-slate-600 text-slate-300 hover:bg-slate-800"
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
              
              <Button
                variant="destructive"
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
              
              <Button
                onClick={handleSubmit}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
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
                    value={post.title}
                    onChange={(e) => setPost({ ...post, title: e.target.value })}
                    placeholder="Enter post title..."
                    className="bg-slate-800 border-slate-600 text-white"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="technology" className="text-white">Technology *</Label>
                  <Select value={post.technology} onValueChange={(value) => setPost({ ...post, technology: value })}>
                    <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                      <SelectValue placeholder="Select technology..." />
                    </SelectTrigger>
                    <SelectContent>
                      {TECHNOLOGIES.map((tech) => (
                        <SelectItem key={tech} value={tech}>
                          {tech}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="excerpt" className="text-white">Excerpt</Label>
                  <Textarea
                    id="excerpt"
                    value={post.excerpt}
                    onChange={(e) => setPost({ ...post, excerpt: e.target.value })}
                    placeholder="Brief description of the post..."
                    className="bg-slate-800 border-slate-600 text-white resize-none"
                    rows={3}
                  />
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
                  value={post.content}
                  onChange={(e) => setPost({ ...post, content: e.target.value })}
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
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="published"
                        checked={post.published}
                        onCheckedChange={(checked) => setPost({ ...post, published: checked })}
                      />
                      <Label htmlFor="published" className="text-white">
                        Published
                      </Label>
                    </div>
                    <p className="text-sm text-gray-400 mt-2">
                      {post.published 
                        ? 'This post is live and visible to visitors' 
                        : 'This post is saved as a draft'
                      }
                    </p>
                  </div>
                  
                  <div className="text-right text-sm text-gray-400">
                    <div>Created: {formatDate(post.createdAt)}</div>
                    {post.updatedAt !== post.createdAt && (
                      <div>Updated: {formatDate(post.updatedAt)}</div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
