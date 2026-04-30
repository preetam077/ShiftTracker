import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Sidebar } from '@/components/layout/Sidebar';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'ShiftTracker — Work Shift Manager',
  description:
    'Track your part-time shifts, hours, and earnings across multiple companies. German-format, euro-currency work log.',
  keywords: ['shift tracker', 'work hours', 'earnings', 'part-time', 'germany'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 min-w-0 ml-0 lg:ml-64 transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
