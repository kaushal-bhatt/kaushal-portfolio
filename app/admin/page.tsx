
'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  BookOpen, 
  Briefcase, 
  Users, 
  Plus,
  Settings,
  LogOut,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';


interface DashboardStats {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  portfolioEntries: number;
}

interface BlogPost {
  id: string;
  title: string;
  technology: string;
  published: boolean;
  createdAt: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<DashboardStats>({
    totalPosts: 5,
    publishedPosts: 3,
    draftPosts: 2,
    portfolioEntries: 8
  });
  const [recentPosts, setRecentPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === 'loading') return; // Still loading
    
    if (status === 'unauthenticated' || !session) {
      router.push('/auth/signin');
      return;
    }
    
    // Load dashboard data only if authenticated
    fetchDashboardData();
  }, [session, status, router]);

  const fetchDashboardData = async () => {
    try {
      console.log('Fetching dashboard data...');
      const [postsResponse, portfolioResponse] = await Promise.all([
        fetch('/api/blog-posts'),
        fetch('/api/portfolio')
      ]);

      console.log('Posts response status:', postsResponse.status);
      console.log('Portfolio response status:', portfolioResponse.status);

      if (postsResponse.ok) {
        const posts = await postsResponse.json();
        console.log('Posts fetched:', posts.length);
        setRecentPosts(posts.slice(0, 5));
        setStats(prev => ({
          ...prev,
          totalPosts: posts.length,
          publishedPosts: posts.filter((p: BlogPost) => p.published).length,
          draftPosts: posts.filter((p: BlogPost) => !p.published).length
        }));
      }

      if (portfolioResponse.ok) {
        const portfolio = await portfolioResponse.json();
        console.log('Portfolio fetched:', portfolio.length);
        setStats(prev => ({
          ...prev,
          portfolioEntries: portfolio.length
        }));
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      console.log('Setting loading to false');
      setLoading(false);
    }
  };

  // Show loading while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, show authentication message (shouldn't happen due to redirect)
  if (!session) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Authentication Required</h1>
          <p className="text-gray-400 mb-6">Please sign in to access the admin dashboard.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const handleSignOut = async () => {
    try {
      // Import signOut dynamically
      const { signOut } = await import('next-auth/react');
      await signOut({ callbackUrl: '/' });
    } catch (error) {
      console.error('Error signing out:', error);
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold gradient-text">Admin Dashboard</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-gray-300">Welcome, {session.user?.name || session.user?.email}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open('/', '_blank')}
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                <Eye className="w-4 h-4 mr-2" />
                View Site
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <Card className="glass-effect border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Total Posts</CardTitle>
              <BookOpen className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalPosts}</div>
            </CardContent>
          </Card>

          <Card className="glass-effect border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Published</CardTitle>
              <BarChart3 className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.publishedPosts}</div>
            </CardContent>
          </Card>

          <Card className="glass-effect border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Drafts</CardTitle>
              <Edit className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.draftPosts}</div>
            </CardContent>
          </Card>

          <Card className="glass-effect border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Portfolio Items</CardTitle>
              <Briefcase className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.portfolioEntries}</div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Posts */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="glass-effect border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-white">Recent Posts</CardTitle>
                <Button
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => router.push('/admin/posts/new')}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Post
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentPosts.map((post) => (
                    <div key={post.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-white text-sm">{post.title}</h4>
                        <div className="flex items-center space-x-2 mt-1">
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
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/admin/posts/${post.id}`)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {recentPosts.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                      <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No blog posts yet. Create your first one!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="glass-effect border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    className="h-24 flex flex-col items-center justify-center border-slate-600 hover:bg-slate-800"
                    onClick={() => router.push('/admin/posts/new')}
                  >
                    <Plus className="w-6 h-6 mb-2" />
                    <span>New Post</span>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-24 flex flex-col items-center justify-center border-slate-600 hover:bg-slate-800"
                    onClick={() => router.push('/admin/posts')}
                  >
                    <BookOpen className="w-6 h-6 mb-2" />
                    <span>Manage Posts</span>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-24 flex flex-col items-center justify-center border-slate-600 hover:bg-slate-800"
                    onClick={() => router.push('/admin/portfolio')}
                  >
                    <Briefcase className="w-6 h-6 mb-2" />
                    <span>Portfolio</span>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-24 flex flex-col items-center justify-center border-slate-600 hover:bg-slate-800"
                    onClick={() => router.push('/admin/settings')}
                  >
                    <Settings className="w-6 h-6 mb-2" />
                    <span>Settings</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
