import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Briefcase, FolderGit2, User, ScrollText, CalendarDays } from 'lucide-react';

export default function AdminDashboard() {

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-slate-400 mt-2">Manage your portfolio content</p>
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
                  Manage roles, dates and achievements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Manage Experience</Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/projects">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FolderGit2 className="mr-2 h-5 w-5" />
                  Projects
                </CardTitle>
                <CardDescription>
                  Manage the open-source projects on /portfolio
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Manage Projects</Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/about">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  About Section
                </CardTitle>
                <CardDescription>
                  Manage the story, skill cards and figures on the home page
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Manage About</Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/booking">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CalendarDays className="mr-2 h-5 w-5" />
                  Book a Call
                </CardTitle>
                <CardDescription>
                  The Calendly section — paste a URL to switch it on, clear it to switch it off
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Manage Booking</Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/resume">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ScrollText className="mr-2 h-5 w-5" />
                  Résumé
                </CardTitle>
                <CardDescription>
                  Every version of the CV — edit, publish, unpublish, duplicate
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Manage Résumé</Button>
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
