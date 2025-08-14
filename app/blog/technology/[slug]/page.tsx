'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Calendar, Tag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { safeTags } from '@/lib/safe-arrays';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  technology: string;
  published: boolean;
  tags: string[];
  readTime: number;
  createdAt: string;
  author: {
    name: string;
  };
}

interface TechSection {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  _count?: { blogPosts: number };
}

export default function TechnologyBlogPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug as string;
  
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [techSection, setTechSection] = useState<TechSection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch tech section first
        const techResponse = await fetch(`/api/tech-sections/${slug}`);
        
        if (techResponse.ok) {
          const techData = await techResponse.json();
          setTechSection(techData);
          
          // Then fetch posts using the tech section name for better matching
          const postsResponse = await fetch(`/api/blog-posts?technology=${encodeURIComponent(techData.name)}`);
          
          if (postsResponse.ok) {
            const postsData = await postsResponse.json();
            const publishedPosts = postsData.filter((post: BlogPost) => post.published);
            setPosts(publishedPosts);
          } else {
            setPosts([]);
          }
        } else {
          throw new Error('Tech section not found');
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setError('Failed to load content.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  const getIconComponent = (iconName: string) => {
    const iconMap: { [key: string]: string } = {
      Coffee: '☕',
      Leaf: '🍃',
      Database: '🗄️',
      Workflow: '⚡',
      Activity: '📊',
      Brain: '🧠',
      Zap: '⚡',
      FileText: '📄'
    };
    return iconMap[iconName] || '📝';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading articles...</p>
        </div>
      </div>
    );
  }

  if (error || !techSection) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Technology Not Found</h1>
          <p className="text-gray-400 mb-6">{error || 'The technology section you are looking for does not exist.'}</p>
          <Link href="/blog">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Blog
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-6">
            <Link href="/blog">
              <Button
                variant="ghost"
                className="text-white hover:bg-slate-800 mb-4"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Blog
              </Button>
            </Link>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="text-4xl mb-4">{getIconComponent(techSection.icon)}</div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              {techSection.name} <span className="gradient-text">Articles</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-6">
              {techSection.description}
            </p>
            <Badge 
              variant="outline" 
              className="border-blue-600/30 text-blue-400 text-lg px-4 py-2"
            >
              {posts.length} {posts.length === 1 ? 'article' : 'articles'}
            </Badge>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {posts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center py-12"
          >
            <div className="text-gray-400 mb-4">
              <div className="text-4xl mb-4">📝</div>
              <h3 className="text-xl font-semibold">No articles yet</h3>
              <p>Articles about {techSection.name} will appear here when published.</p>
            </div>
            <Link href="/blog">
              <Button className="mt-6">
                Explore Other Technologies
              </Button>
            </Link>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="cursor-pointer"
                onClick={() => router.push(`/blog/post/${post.slug}`)}
              >
                <Card className="bg-slate-800 border-slate-700 hover:border-blue-600/50 transition-all duration-300 h-full group">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-4">
                      <Badge 
                        variant="outline" 
                        className="border-blue-600/30 text-blue-400"
                      >
                        {post.technology}
                      </Badge>
                      <div className="flex items-center text-gray-400 text-sm">
                        <Clock className="w-4 h-4 mr-1" />
                        {post.readTime} min read
                      </div>
                    </div>
                    
                    <CardTitle className="text-white text-xl leading-tight group-hover:text-blue-400 transition-colors">
                      {post.title}
                    </CardTitle>
                    
                    <div className="flex items-center text-gray-400 text-sm">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(post.createdAt).toLocaleDateString()}
                      <span className="mx-2">•</span>
                      <span>by {post.author.name}</span>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <p className="text-gray-300 mb-6 leading-relaxed">
                      {post.excerpt}
                    </p>
                    
                    <div className="flex flex-wrap gap-2">
                      {safeTags(post.tags)?.slice(0, 3).map((tag) => (
                        <Badge 
                          key={tag}
                          variant="secondary"
                          className="bg-slate-700 text-gray-300 text-xs"
                        >
                          <Tag className="w-3 h-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                      {safeTags(post.tags)?.length > 3 && (
                        <Badge 
                          variant="secondary"
                          className="bg-slate-700 text-gray-300 text-xs"
                        >
                          +{safeTags(post.tags).length - 3} more
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
