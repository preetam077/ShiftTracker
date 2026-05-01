import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AppShell } from '@/components/layout/AppShell';

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
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
