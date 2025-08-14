'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';

interface Portfolio {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string | null;
  current: boolean;
  description: string;
  technologies: string;
  achievements: string;
  order: number;
}

export default function PortfolioManagement() {
  const router = useRouter();
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Portfolio>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchPortfolios();
  }, []);

  const fetchPortfolios = async () => {
    try {
      const response = await fetch('/api/admin/portfolio');
      if (response.ok) {
        const data = await response.json();
        setPortfolios(data);
      } else {
        setError('Failed to fetch portfolio items');
      }
    } catch (error) {
      console.error('Failed to fetch portfolio items:', error);
      setError('Failed to fetch portfolio items');
    }
  };

  const handleEdit = (portfolio: Portfolio) => {
    setEditingId(portfolio.id);
    setFormData(portfolio);
    setError(null);
    setSuccess(null);
  };

  const handleSave = async () => {
    if (!formData.company || !formData.role || !formData.startDate || !formData.description) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const url = editingId === 'new' ? '/api/admin/portfolio' : `/api/admin/portfolio/${editingId}`;
      const method = editingId === 'new' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchPortfolios();
        setEditingId(null);
        setFormData({});
        setSuccess(editingId === 'new' ? 'Experience added successfully!' : 'Experience updated successfully!');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to save portfolio item');
      }
    } catch (error) {
      console.error('Failed to save portfolio item:', error);
      setError('Failed to save portfolio item');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this portfolio item?')) return;

    try {
      const response = await fetch(`/api/admin/portfolio/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchPortfolios();
        setSuccess('Experience deleted successfully!');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to delete portfolio item');
      }
    } catch (error) {
      console.error('Failed to delete portfolio item:', error);
      setError('Failed to delete portfolio item');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({});
    setError(null);
    setSuccess(null);
  };

  const startCreate = () => {
    setEditingId('new');
    setFormData({
      company: '',
      role: '',
      startDate: '',
      endDate: '',
      current: false,
      description: '',
      technologies: '',
      achievements: '',
      order: portfolios.length + 1,
    });
    setError(null);
    setSuccess(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => router.push('/admin')}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-2xl font-bold">Portfolio Management</h1>
          </div>
          <Button onClick={startCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Add Experience
          </Button>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            {success}
          </div>
        )}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {editingId && (
          <Card>
            <CardHeader>
              <CardTitle>{editingId === 'new' ? 'Add New Experience' : 'Edit Experience'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company *</label>
                  <Input
                    placeholder="Company"
                    value={formData.company || ''}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                  <Input
                    placeholder="Role"
                    value={formData.role || ''}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                  <Input
                    type="date"
                    value={formData.startDate || ''}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <Input
                    type="date"
                    value={formData.endDate || ''}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    disabled={formData.current}
                  />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.current || false}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        current: e.target.checked,
                        endDate: e.target.checked ? null : formData.endDate
                      })}
                    />
                    <span className="text-sm">Current Position</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <Textarea
                  placeholder="Description"
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Technologies</label>
                <Input
                  placeholder="Technologies (comma-separated)"
                  value={formData.technologies || ''}
                  onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Achievements</label>
                <Textarea
                  placeholder="Achievements (comma-separated)"
                  value={formData.achievements || ''}
                  onChange={(e) => setFormData({ ...formData, achievements: e.target.value })}
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                <Input
                  type="number"
                  placeholder="Display Order"
                  value={formData.order || ''}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSave} disabled={loading}>
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? 'Saving...' : 'Save'}
                </Button>
                <Button variant="outline" onClick={handleCancel}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4">
          {portfolios.map((portfolio) => (
            <Card key={portfolio.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{portfolio.role}</h3>
                    <p className="text-gray-600">{portfolio.company}</p>
                    <p className="text-sm text-gray-500">
                      {portfolio.startDate} - {portfolio.current ? 'Present' : portfolio.endDate}
                    </p>
                    <p className="mt-2 text-sm">{portfolio.description}</p>
                    
                    {portfolio.technologies && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {portfolio.technologies.split(',').map((tech, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tech.trim()}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    {portfolio.achievements && (
                      <div className="mt-2">
                        <p className="text-xs font-medium text-gray-700">Achievements:</p>
                        <ul className="text-xs text-gray-600 list-disc list-inside">
                          {portfolio.achievements.split(',').map((achievement, index) => (
                            <li key={index}>{achievement.trim()}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleEdit(portfolio)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => handleDelete(portfolio.id)}
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
