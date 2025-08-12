
'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Calendar, Tag, Search, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';

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

export default function BlogPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [techSections, setTechSections] = useState<TechSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTech, setSelectedTech] = useState('All');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [postsResponse, techResponse] = await Promise.all([
          fetch('/api/blog-posts'),
          fetch('/api/tech-sections')
        ]);

        if (postsResponse.ok) {
          const postsData = await postsResponse.json();
          setPosts(postsData);
        }

        if (techResponse.ok) {
          const techData = await techResponse.json();
          setTechSections(techData);
        }
      } catch (error) {
        console.error('Failed to fetch blog data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesTech = selectedTech === 'All' || post.technology === selectedTech;
    
    return matchesSearch && matchesTech && post.published;
  });

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
          <p className="text-gray-400">Loading blog posts...</p>
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
            <Link href="/">
              <Button
                variant="ghost"
                className="text-white hover:bg-slate-800 mb-4"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Technical <span className="gradient-text">Blog</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Insights, tutorials, and deep dives into modern technologies
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-12"
        >
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-800 border-slate-700 text-white placeholder-gray-400"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={selectedTech === 'All' ? "default" : "outline"}
                onClick={() => setSelectedTech('All')}
                className={`${
                  selectedTech === 'All'
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "border-slate-600 text-slate-300 hover:bg-slate-800"
                }`}
              >
                All ({posts.filter(p => p.published).length})
              </Button>
              {techSections.map((tech) => (
                <Button
                  key={tech.id}
                  variant={selectedTech === tech.name ? "default" : "outline"}
                  onClick={() => setSelectedTech(tech.name)}
                  className={`${
                    selectedTech === tech.name
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "border-slate-600 text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  {getIconComponent(tech.icon)} {tech.name} ({tech._count?.blogPosts || 0})
                </Button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Blog Posts */}
        {filteredPosts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center py-12"
          >
            <div className="text-gray-400 mb-4">
              <Filter className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-xl font-semibold">No articles found</h3>
              <p>Try adjusting your search or filter criteria</p>
            </div>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post, index) => (
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
                      {post.tags?.slice(0, 3).map((tag) => (
                        <Badge 
                          key={tag}
                          variant="secondary"
                          className="bg-slate-700 text-gray-300 text-xs"
                        >
                          <Tag className="w-3 h-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                      {post.tags?.length > 3 && (
                        <Badge 
                          variant="secondary"
                          className="bg-slate-700 text-gray-300 text-xs"
                        >
                          +{post.tags.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Technology Sections */}
        {techSections.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-16 pt-12 border-t border-slate-700"
          >
            <h2 className="text-2xl font-bold text-white mb-8 text-center">Explore by Technology</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {techSections.map((tech) => (
                <motion.div
                  key={tech.id}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="cursor-pointer"
                  onClick={() => router.push(`/blog/technology/${tech.slug}`)}
                >
                  <Card className="bg-slate-800 border-slate-700 hover:border-blue-600/50 transition-all duration-300 text-center">
                    <CardContent className="p-6">
                      <div className="text-3xl mb-3">{getIconComponent(tech.icon)}</div>
                      <h3 className="text-lg font-semibold text-white mb-2">{tech.name}</h3>
                      <p className="text-gray-400 text-sm mb-3">{tech.description}</p>
                      <Badge 
                        variant="secondary" 
                        className="bg-blue-600/20 text-blue-400 border-blue-600/30"
                      >
                        {tech._count?.blogPosts || 0} articles
                      </Badge>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
