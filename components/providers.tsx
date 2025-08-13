
'use client';

import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from './theme-provider';
import { Toaster } from 'sonner';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange
      >
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'rgb(30 41 59)',
              border: '1px solid rgb(51 65 85)',
              color: 'rgb(241 245 249)',
            },
          }}
        />
      </ThemeProvider>
    </SessionProvider>
  );
}
