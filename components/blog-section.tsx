
'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { BookOpen, Clock, Tag, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

interface TechSection {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  order: number;
  _count?: { blogPosts: number };
}

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

export function BlogSection() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  const [techSections, setTechSections] = useState<TechSection[]>([]);
  const [recentPosts, setRecentPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [techResponse, postsResponse] = await Promise.all([
          fetch('/api/tech-sections'),
          fetch('/api/blog-posts?limit=6')
        ]);

        if (techResponse.ok) {
          const techData = await techResponse.json();
          setTechSections(techData);
        }

        if (postsResponse.ok) {
          const postsData = await postsResponse.json();
          setRecentPosts(postsData);
        }
      } catch (error) {
        console.error('Failed to fetch blog data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <section id="blog" className="py-20 bg-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-slate-700 rounded w-64 mx-auto mb-4"></div>
              <div className="h-4 bg-slate-700 rounded w-96 mx-auto"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const getIconComponent = (iconName: string) => {
    // Mapping icon names to actual components for demo
    const iconMap: { [key: string]: any } = {
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

  return (
    <section id="blog" ref={ref} className="py-20 bg-slate-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
            Technical <span className="gradient-text">Blog</span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto px-4">
            Sharing insights, best practices, and deep dives into modern technologies
          </p>
        </motion.div>

        {/* Technology Sections */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-16"
        >
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-6 sm:mb-8 text-center px-4">Explore by Technology</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {techSections.map((tech, index) => (
              <motion.div
                key={tech.id}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                className="cursor-pointer"
                onClick={() => window.open(`/blog/${tech.slug}`, '_blank')}
              >
                <Card className="glass-effect border-slate-700 hover:border-blue-600/50 transition-all duration-300">
                  <CardContent className="p-3 sm:p-6 text-center">
                    <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">{getIconComponent(tech.icon)}</div>
                    <h4 className="text-sm sm:text-lg font-semibold text-white mb-1 sm:mb-2">{tech.name}</h4>
                    <p className="text-gray-400 text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-2">{tech.description}</p>
                    <Badge 
                      variant="secondary" 
                      className="bg-blue-600/20 text-blue-400 border-blue-600/30 text-xs"
                    >
                      {tech._count?.blogPosts || 0} articles
                    </Badge>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recent Posts */}
        {recentPosts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-6 sm:mb-8 text-center px-4">Recent Articles</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {recentPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  whileHover={{ scale: 1.02, y: -5 }}
                  className="cursor-pointer"
                  onClick={() => window.open(`/blog/post/${post.slug}`, '_blank')}
                >
                  <Card className="glass-effect border-slate-700 hover:border-blue-600/50 transition-all duration-300 h-full">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between mb-2">
                        <Badge 
                          variant="outline" 
                          className="border-blue-600/30 text-blue-400"
                        >
                          {post.technology}
                        </Badge>
                        <div className="flex items-center text-gray-400 text-sm">
                          <Clock className="w-4 h-4 mr-1" />
                          {post.readTime} min
                        </div>
                      </div>
                      <h4 className="text-lg font-semibold text-white leading-tight">
                        {post.title}
                      </h4>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                        {post.excerpt}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-1">
                          {post.tags?.slice(0, 2).map((tag) => (
                            <Badge 
                              key={tag} 
                              variant="secondary" 
                              className="text-xs bg-slate-700 text-gray-300"
                            >
                              {tag}
                            </Badge>
                          ))}
                          {post.tags?.length > 2 && (
                            <Badge variant="secondary" className="text-xs bg-slate-700 text-gray-300">
                              +{post.tags.length - 2}
                            </Badge>
                          )}
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(`/blog/post/${post.slug}`, '_blank')}
                          className="text-blue-400 hover:text-blue-300 p-0 h-auto"
                        >
                          Read <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center mt-12"
        >
          <Button
            variant="outline"
            size="lg"
            onClick={() => window.open('/blog', '_blank')}
            className="border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white transition-all duration-300"
          >
            <BookOpen className="w-5 h-5 mr-2" />
            View All Articles
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
