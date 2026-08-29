
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Kaushal Bhatt - Senior Backend Engineer',
  description: 'Senior Backend Engineer with 7 years building high-throughput, event-driven microservices in fintech and crypto custody. Java, Spring Boot, Kafka, AWS. Open to EU relocation.',
  keywords: ['Kaushal Bhatt', 'Backend Engineer', 'Java Developer', 'Spring Boot', 'Kafka', 'AWS', 'Microservices', 'WebAuthn', 'Passkeys'],
  authors: [{ name: 'Kaushal Bhatt' }],
  openGraph: {
    title: 'Kaushal Bhatt - Senior Backend Engineer',
    description: '7 years of Java, Spring Boot, Kafka and AWS in regulated fintech and crypto custody.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kaushal Bhatt - Senior Backend Engineer',
    description: '7 years of Java, Spring Boot, Kafka and AWS in regulated fintech and crypto custody.',
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
