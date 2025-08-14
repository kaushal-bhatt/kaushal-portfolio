import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileText, Briefcase, Settings } from 'lucide-react';

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user?.role !== 'admin') {
    redirect('/auth/signin');
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your portfolio content</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/admin/posts">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 h-5 w-5" />
                  Blog Posts
                </CardTitle>
                <CardDescription>
                  Create and manage blog posts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Manage Posts</Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/portfolio">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Briefcase className="mr-2 h-5 w-5" />
                  Professional Experience
                </CardTitle>
                <CardDescription>
                  Manage work experience and projects
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Manage Experience</Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/settings">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="mr-2 h-5 w-5" />
                  Settings
                </CardTitle>
                <CardDescription>
                  Manage tech sections and settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Manage Settings</Button>
              </CardContent>
            </Card>
          </Link>
        </div>

        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-4">
                <Link href="/admin/posts/new">
                  <Button>Create New Post</Button>
                </Link>
                <Link href="/admin/portfolio">
                  <Button variant="outline">Add Experience</Button>
                </Link>
                <Link href="/">
                  <Button variant="outline">View Live Site</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
