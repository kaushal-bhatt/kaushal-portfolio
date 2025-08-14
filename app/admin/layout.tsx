'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    
    console.log('Session:', session);
    console.log('User role:', session?.user?.role);
    
    if (!session) {
      console.log('No session, redirecting to signin');
      router.push('/auth/signin');
      return;
    }
    
    if (session.user?.role !== 'admin') {
      console.log('User is not admin, redirecting to signin');
      router.push('/auth/signin');
      return;
    }
    
    console.log('User is admin, showing content');
    setShowContent(true);
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session || session.user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <h1 className="text-2xl mb-4">Access Denied</h1>
          <p className="mb-4">Admin access required</p>
          <button 
            onClick={() => router.push('/auth/signin')}
            className="bg-blue-600 px-4 py-2 rounded"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (!showContent) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return <>{children}</>;
}
