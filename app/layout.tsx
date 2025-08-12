
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Kaushal Bhatt - Senior Software Engineer',
  description: 'Experienced Senior Software Engineer with 5+ years of expertise in designing and implementing highly distributed, scalable cloud-based applications using Java, Spring Boot, and AWS.',
  keywords: ['Kaushal Bhatt', 'Software Engineer', 'Java Developer', 'Spring Boot', 'AWS', 'Microservices'],
  authors: [{ name: 'Kaushal Bhatt' }],
  openGraph: {
    title: 'Kaushal Bhatt - Senior Software Engineer',
    description: 'Experienced Senior Software Engineer specializing in Java, Spring Boot, and cloud-native applications.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kaushal Bhatt - Senior Software Engineer',
    description: 'Experienced Senior Software Engineer specializing in Java, Spring Boot, and cloud-native applications.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
