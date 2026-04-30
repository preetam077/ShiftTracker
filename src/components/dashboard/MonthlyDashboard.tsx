'use client';

import { BarChart3, Briefcase, Calendar, Clock, TrendingUp } from 'lucide-react';
import { formatEuro, formatHours } from '@/lib/calculations';
import { MonthlyStats } from '@/lib/types';
import { StatCard } from '@/components/ui/StatCard';

interface MonthlyDashboardProps {
  stats: MonthlyStats;
  month: number;
  year: number;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function MonthlyDashboard({ stats, month, year }: MonthlyDashboardProps) {
  const monthName = MONTHS[month - 1];

  return (
    <div>
      <p className="text-[var(--text-muted)] text-sm mb-4 fade-up">
        Overview for <span className="text-[var(--text-primary)] font-semibold">{monthName} {year}</span>
      </p>

      {stats.totalShifts === 0 ? (
        <div className="glass-card p-10 text-center fade-up">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-[var(--text-primary)] font-semibold">No shifts recorded</p>
          <p className="text-[var(--text-muted)] text-sm mt-1">Add some shifts to see your monthly stats</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <StatCard
            label="Total Shifts"
            value={String(stats.totalShifts)}
            sub={`${stats.totalDays} working days`}
            icon={<Calendar size={20} />}
            accentColor="#7c6fea"
            delay={0}
          />
          <StatCard
            label="Hours Worked"
            value={formatHours(stats.totalHours)}
            icon={<Clock size={20} />}
            accentColor="#12d8c0"
            delay={1}
          />
          <StatCard
            label="Total Earnings"
            value={formatEuro(stats.totalEarnings)}
            icon={<TrendingUp size={20} />}
            accentColor="#f59e0b"
            delay={2}
          />
          <StatCard
            label="Work Type"
            value={`FT ${stats.fullTimeDays} · PT ${stats.partTimeDays}`}
            sub="FT > 4h · PT ≤ 4h"
            icon={<Briefcase size={20} />}
            accentColor="#ec4899"
            delay={3}
          />
          <StatCard
            label="Companies"
            value={String(stats.companySummaries.length)}
            sub="active this month"
            icon={<BarChart3 size={20} />}
            accentColor="#22c55e"
            delay={4}
          />
        </div>
      )}
    </div>
  );
}
