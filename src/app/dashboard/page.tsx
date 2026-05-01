'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Download, Plus } from 'lucide-react';
import Link from 'next/link';
import { useShifts } from '@/hooks/useShifts';
import { exportToCSV, getMonthlyStats } from '@/lib/calculations';
import { MonthlyDashboard } from '@/components/dashboard/MonthlyDashboard';
import { CompanySummary } from '@/components/dashboard/CompanySummary';
import { EarningsChart } from '@/components/dashboard/EarningsChart';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function DashboardPage() {
  const { shifts, loading } = useShifts();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const stats = getMonthlyStats(shifts, month, year);

  if (loading) {
    return (
      <div className="space-y-6 pt-10 lg:pt-0">
        <div className="h-10 shimmer rounded-xl w-48" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-28 shimmer rounded-xl" />)}
        </div>
        <div className="h-64 shimmer rounded-xl" />
      </div>
    );
  }
  const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - i);

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  };

  const isCurrentMonth = month === now.getMonth() + 1 && year === now.getFullYear();

  return (
    <div className="space-y-6 pt-10 lg:pt-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between fade-up">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Dashboard</h1>
          <p className="text-[var(--text-muted)] text-sm mt-0.5">Your monthly earnings overview</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Month picker */}
          <div className="flex items-center gap-1 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-1">
            <button onClick={prevMonth} className="btn-ghost p-1.5 rounded-lg">
              <ChevronLeft size={16} />
            </button>
            <select
              className="bg-transparent border-none text-[var(--text-primary)] font-medium text-sm cursor-pointer outline-none px-1"
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
            >
              {MONTHS.map((m, i) => (
                <option key={m} value={i + 1} style={{ background: '#161923' }}>{m}</option>
              ))}
            </select>
            <select
              className="bg-transparent border-none text-[var(--text-primary)] font-medium text-sm cursor-pointer outline-none px-1"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
            >
              {years.map((y) => (
                <option key={y} value={y} style={{ background: '#161923' }}>{y}</option>
              ))}
            </select>
            <button onClick={nextMonth} className="btn-ghost p-1.5 rounded-lg">
              <ChevronRight size={16} />
            </button>
          </div>

          {!isCurrentMonth && (
            <button
              className="btn-ghost text-xs py-2 px-3"
              onClick={() => { setMonth(now.getMonth() + 1); setYear(now.getFullYear()); }}
            >
              This Month
            </button>
          )}

          {stats.totalShifts > 0 && (
            <button
              className="btn-secondary text-sm"
              onClick={() => exportToCSV(shifts, month, year)}
            >
              <Download size={15} />
              Export CSV
            </button>
          )}

          <Link href="/shifts/new" className="btn-primary text-sm">
            <Plus size={15} />
            Add Shift
          </Link>
        </div>
      </div>

      {/* Stats */}
      <MonthlyDashboard stats={stats} month={month} year={year} />

      {/* Chart */}
      {stats.dailyEarnings.length > 0 && (
        <EarningsChart data={stats.dailyEarnings} />
      )}

      {/* Company breakdown */}
      {stats.companySummaries.length > 0 && (
        <CompanySummary summaries={stats.companySummaries} grandTotal={stats.totalEarnings} />
      )}
    </div>
  );
}
