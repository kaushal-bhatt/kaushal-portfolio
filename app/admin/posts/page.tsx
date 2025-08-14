'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus,
  Edit,
  Eye,
  Trash2,
  ArrowLeft,
  Search,
  Filter
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  technology: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function ManagePosts() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all');

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session?.user || session.user.role !== 'admin') {
      router.push('/auth/signin');
      return;
    }

    fetchPosts();
  }, [session, status, router]);

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/blog-posts');
      if (response.ok) {
        const data = await response.json();
        setPosts(data);
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const response = await fetch(`/api/blog-posts?id=${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setPosts(posts.filter(p => p.id !== id));
        alert('Post deleted successfully');
      } else {
        const error = await response.json();
        alert(`Failed to delete post: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to delete post:', error);
      alert('Failed to delete post');
    }
  };

  const togglePublished = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/blog-posts`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          id, 
          published: !currentStatus 
        }),
      });
      
      if (response.ok) {
        setPosts(posts.map(p => 
          p.id === id ? { ...p, published: !currentStatus } : p
        ));
        alert(`Post ${!currentStatus ? 'published' : 'unpublished'} successfully`);
      } else {
        const error = await response.json();
        alert(`Failed to update post: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to update post:', error);
      alert('Failed to update post status');
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
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.technology.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'published' && post.published) ||
                         (filterStatus === 'draft' && !post.published);
    return matchesSearch && matchesFilter;
  });

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

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => router.push('/admin')}
                className="text-gray-300 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <h1 className="text-xl font-bold gradient-text">Manage Posts</h1>
            </div>
            
            <Button
              onClick={() => router.push('/admin/posts/new')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Post
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 flex flex-col sm:flex-row gap-4"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-800 border-slate-600 text-white"
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              variant={filterStatus === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('all')}
              className={filterStatus === 'all' ? 'bg-blue-600' : 'border-slate-600 text-slate-300 hover:bg-slate-800'}
            >
              All ({posts.length})
            </Button>
            <Button
              variant={filterStatus === 'published' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('published')}
              className={filterStatus === 'published' ? 'bg-green-600' : 'border-slate-600 text-slate-300 hover:bg-slate-800'}
            >
              Published ({posts.filter(p => p.published).length})
            </Button>
            <Button
              variant={filterStatus === 'draft' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('draft')}
              className={filterStatus === 'draft' ? 'bg-yellow-600' : 'border-slate-600 text-slate-300 hover:bg-slate-800'}
            >
              Drafts ({posts.filter(p => !p.published).length})
            </Button>
          </div>
        </motion.div>

        {/* Posts Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid gap-6"
        >
          {filteredPosts.map((post) => (
            <Card key={post.id} className="glass-effect border-slate-700 hover:border-slate-600 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-white">{post.title}</h3>
                      <Badge
                        variant={post.published ? 'secondary' : 'outline'}
                        className={post.published ? 'bg-green-600/20 text-green-400' : 'border-yellow-600/30 text-yellow-400'}
                      >
                        {post.published ? 'Published' : 'Draft'}
                      </Badge>
                      <Badge variant="outline" className="border-blue-600/30 text-blue-400">
                        {post.technology}
                      </Badge>
                    </div>
                    
                    <p className="text-gray-300 mb-4 line-clamp-2">{post.excerpt}</p>
                    
                    <div className="text-sm text-gray-400">
                      Created: {formatDate(post.createdAt)}
                      {post.updatedAt !== post.createdAt && (
                        <span className="ml-4">
                          Updated: {formatDate(post.updatedAt)}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(`/blog/post/${post.slug}`, '_blank')}
                      className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/20"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/admin/posts/${post.id}`)}
                      className="text-green-400 hover:text-green-300 hover:bg-green-500/20"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => togglePublished(post.id, post.published)}
                      className={post.published 
                        ? "text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/20" 
                        : "text-green-400 hover:text-green-300 hover:bg-green-500/20"
                      }
                    >
                      {post.published ? 'Unpublish' : 'Publish'}
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(post.id)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {filteredPosts.length === 0 && (
            <Card className="glass-effect border-slate-700">
              <CardContent className="p-12 text-center">
                <div className="text-gray-400">
                  <Plus className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No posts found</h3>
                  <p className="mb-6">
                    {searchTerm || filterStatus !== 'all' 
                      ? 'Try adjusting your search or filters' 
                      : 'Create your first blog post to get started'
                    }
                  </p>
                  <Button
                    onClick={() => router.push('/admin/posts/new')}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Post
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
}
