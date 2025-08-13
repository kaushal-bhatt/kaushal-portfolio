
'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Eye, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const TECHNOLOGIES = [
  'Java', 'Spring Boot', 'React', 'Next.js', 'TypeScript', 'JavaScript',
  'Python', 'Node.js', 'AWS', 'Docker', 'Kubernetes', 'PostgreSQL',
  'MongoDB', 'Redis', 'Kafka', 'Microservices', 'GraphQL', 'REST API'
];

interface BlogPostForm {
  title: string;
  excerpt: string;
  content: string;
  technology: string;
  published: boolean;
}

export default function NewPost() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<BlogPostForm>({
    title: '',
    excerpt: '',
    content: '',
    technology: '',
    published: false
  });

  useEffect(() => {
    if (status === 'loading') return;
    
    // For testing purposes, comment out auth check
    // if (!session?.user || session.user.role !== 'admin') {
    //   router.push('/auth/signin');
    //   return;
    // }
  }, [session, status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.content || !formData.technology) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch('/api/blog-posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const newPost = await response.json();
        
        if (formData.published) {
          toast.success('🎉 Post published successfully!', {
            description: 'Your post is now live and visible to all visitors.',
            action: {
              label: 'View Post',
              onClick: () => window.open(`/blog/post/${newPost.slug}`, '_blank')
            }
          });
        } else {
          toast.success('✅ Draft saved successfully!', {
            description: 'Your post has been saved as a draft.',
          });
        }
        
        // Redirect to manage posts after a short delay
        setTimeout(() => {
          router.push('/admin/posts');
        }, 2000);
      } else {
        const error = await response.text();
        toast.error('Failed to create post', {
          description: error
        });
      }
    } catch (error) {
      console.error('Failed to create post:', error);
      toast.error('Failed to create post', {
        description: 'Something went wrong. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    const draftData = { ...formData, published: false };
    setFormData(draftData);
    
    if (!draftData.title) {
      toast.error('Please provide at least a title to save as draft');
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch('/api/blog-posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(draftData),
      });

      if (response.ok) {
        const newPost = await response.json();
        toast.success('📝 Draft saved successfully!', {
          description: 'You can continue editing or publish it later.',
        });
        
        // Redirect to manage posts after a short delay
        setTimeout(() => {
          router.push('/admin/posts');
        }, 1500);
      } else {
        toast.error('Failed to save draft');
      }
    } catch (error) {
      console.error('Failed to save draft:', error);
      toast.error('Failed to save draft');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // For testing purposes, comment out auth check
  // if (!session?.user || session.user.role !== 'admin') {
  //   return null;
  // }

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
                  <Label htmlFor="technology" className="text-white">Technology *</Label>
                  <Select onValueChange={(value) => setFormData({ ...formData, technology: value })}>
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
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
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
