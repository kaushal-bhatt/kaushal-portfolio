
'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Edit, Trash2, ExternalLink, Calendar, Code, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface PortfolioEntry {
  id: string;
  company: string;
  role: string;
  description: string;
  technologies: string[];
  achievements: string[];
  startDate: string;
  endDate?: string;
  current: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export default function AdminPortfolioPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [entries, setEntries] = useState<PortfolioEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const response = await fetch('/api/portfolio');
      if (response.ok) {
        const data = await response.json();
        setEntries(data);
      } else {
        toast.error('Failed to fetch portfolio entries');
      }
    } catch (error) {
      console.error('Error fetching entries:', error);
      toast.error('Failed to fetch portfolio entries');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEntry = async (id: string) => {
    if (!confirm('Are you sure you want to delete this experience entry?')) {
      return;
    }

    try {
      const response = await fetch(`/api/portfolio/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Experience entry deleted successfully');
        setEntries(entries.filter(e => e.id !== id));
      } else {
        toast.error('Failed to delete experience entry');
      }
    } catch (error) {
      console.error('Error deleting entry:', error);
      toast.error('Failed to delete experience entry');
    }
  };



  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="text-white hover:bg-slate-800 mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white">Experience Management</h1>
              <p className="text-slate-400 mt-2">Manage your work experience and professional portfolio</p>
            </div>
            
            <Button
              onClick={() => toast('Experience entry creation coming soon!')}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="mr-2 h-4 w-4" />
              New Experience
            </Button>
          </div>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="text-2xl font-bold text-white">{entries.length}</div>
                <div className="ml-2 text-sm text-gray-400">Total Experiences</div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="text-2xl font-bold text-green-400">
                  {entries.filter(e => e.current).length}
                </div>
                <div className="ml-2 text-sm text-gray-400">Current</div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="text-2xl font-bold text-blue-400">
                  {entries.filter(e => !e.current).length}
                </div>
                <div className="ml-2 text-sm text-gray-400">Past Roles</div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="text-2xl font-bold text-purple-400">
                  {entries.reduce((total, entry) => total + entry.technologies.length, 0)}
                </div>
                <div className="ml-2 text-sm text-gray-400">Technologies</div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Experience List */}
        {entries.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center py-12"
          >
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-12">
                <Code className="w-16 h-16 mx-auto mb-6 text-gray-400" />
                <h3 className="text-xl font-semibold text-white mb-2">No Experience Entries Yet</h3>
                <p className="text-gray-400 mb-6">Start building your portfolio by adding your work experience.</p>
                <Button
                  onClick={() => toast('Experience entry creation coming soon!')}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Experience
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <div className="grid gap-6">
            {entries.map((entry, index) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors">
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CardTitle className="text-white text-xl">{entry.role}</CardTitle>
                          <Badge variant="secondary" className="bg-blue-600/20 text-blue-400">
                            {entry.company}
                          </Badge>
                          {entry.current && (
                            <Badge className="bg-green-600/20 text-green-400 border-green-600/30">
                              Current
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-400 mb-3">
                          <Calendar className="w-4 h-4 mr-1" />
                          {entry.startDate}
                          {entry.endDate && !entry.current && (
                            <>
                              {' - '}
                              {entry.endDate}
                            </>
                          )}
                          {entry.current && ' - Present'}
                        </div>
                        
                        <p className="text-gray-300 mb-4 leading-relaxed">
                          {entry.description}
                        </p>
                        
                        {entry.achievements && entry.achievements.length > 0 && (
                          <div className="mb-4">
                            <h4 className="text-sm font-medium text-white mb-2">Key Achievements:</h4>
                            <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
                              {entry.achievements.map((achievement, idx) => (
                                <li key={idx}>{achievement}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                          {entry.technologies.map((tech) => (
                            <Badge 
                              key={tech}
                              variant="secondary"
                              className="bg-slate-700 text-slate-300 text-xs"
                            >
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toast('Experience editing coming soon!')}
                          className="border-slate-600 hover:bg-slate-700"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteEntry(entry.id)}
                          className="border-red-600/30 text-red-400 hover:bg-red-600/20 hover:border-red-600/50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
