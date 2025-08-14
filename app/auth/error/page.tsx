'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { Suspense } from 'react';

const errorMessages: Record<string, string> = {
  Signin: 'Sign in failed. Please check your credentials.',
  OAuthSignin: 'Error signing in with OAuth provider.',
  OAuthCallback: 'Error in OAuth callback.',
  OAuthCreateAccount: 'Could not create OAuth account.',
  EmailCreateAccount: 'Could not create email account.',
  Callback: 'Error in callback.',
  OAuthAccountNotLinked: 'Account not linked. Please sign in with the same provider you used originally.',
  EmailSignin: 'Check your email for the sign in link.',
  CredentialsSignin: 'Invalid email or password. Please try again.',
  SessionRequired: 'Please sign in to access this page.',
  default: 'An error occurred during authentication.',
};

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  
  const errorMessage = error && errorMessages[error] 
    ? errorMessages[error] 
    : errorMessages.default;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-red-600">
            Authentication Error
          </CardTitle>
          <CardDescription className="text-center">
            There was a problem with your sign in attempt
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
          
          {error === 'CredentialsSignin' && (
            <div className="p-4 bg-yellow-50 rounded-md">
              <h4 className="text-sm font-medium text-yellow-800 mb-2">
                Security Notice
              </h4>
              <p className="text-sm text-yellow-700">
                Multiple failed attempts may temporarily lock your account for security purposes.
              </p>
            </div>
          )}
          
          <div className="flex flex-col space-y-2">
            <Link href="/auth/signin">
              <Button className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </Link>
            
            <Link href="/">
              <Button variant="outline" className="w-full">
                Back to Home
              </Button>
            </Link>
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              If you continue to experience issues, please contact support.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AuthError() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  );
}
