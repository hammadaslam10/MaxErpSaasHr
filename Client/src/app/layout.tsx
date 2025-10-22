import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../styles/globals.css';
import { Providers } from '@/redux/Providers';
import ErrorBoundary from '@/components/ErrorBoundary';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MaxERP - Leave Management System',
  description: 'A comprehensive leave management system for HR departments',
  keywords: 'leave management, HR, employee, manager, vacation, sick leave',
  authors: [{ name: 'MaxERP Team' }],
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <ErrorBoundary>
            <div className="min-h-screen bg-gray-50">
              {children}
            </div>
          </ErrorBoundary>
        </Providers>
      </body>
    </html>
  );
}