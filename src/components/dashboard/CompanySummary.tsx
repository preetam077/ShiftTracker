'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { formatEuro, formatHours } from '@/lib/calculations';
import { CompanySummary as CompanySummaryType } from '@/lib/types';

interface CompanySummaryProps {
  summaries: CompanySummaryType[];
  grandTotal: number;
}

export function CompanySummary({ summaries, grandTotal }: CompanySummaryProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (summaries.length === 0) return null;

  return (
    <div>
      <h2 className="text-[var(--text-primary)] font-semibold text-base mb-3 fade-up">
        By Company
      </h2>
      <div className="space-y-3">
        {summaries.map((s, i) => {
          const pct = grandTotal > 0 ? (s.totalEarnings / grandTotal) * 100 : 0;
          const isOpen = expanded === s.company;
          return (
            <div
              key={s.company}
              className="glass-card overflow-hidden fade-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              {/* Header */}
              <button
                className="w-full flex items-center gap-3 p-4 text-left hover:bg-[var(--bg-elevated)] transition-colors"
                onClick={() => setExpanded(isOpen ? null : s.company)}
              >
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ background: s.color, boxShadow: `0 0 8px ${s.color}60` }}
                />
                <span className="flex-1 font-semibold text-[var(--text-primary)] text-sm">
                  {s.company}
                </span>
                <span className="font-bold gradient-text text-sm">{formatEuro(s.totalEarnings)}</span>
                <span className="text-[var(--text-muted)] text-xs w-10 text-right">{pct.toFixed(0)}%</span>
                {isOpen ? <ChevronUp size={16} className="text-[var(--text-muted)] flex-shrink-0" /> : <ChevronDown size={16} className="text-[var(--text-muted)] flex-shrink-0" />}
              </button>

              {/* Progress bar */}
              <div className="h-0.5 bg-[var(--bg-elevated)]">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, background: s.color }}
                />
              </div>

              {/* Expanded details */}
              {isOpen && (
                <div className="px-4 pb-4 pt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[var(--bg-elevated)] fade-up">
                  {[
                    { label: 'Shifts', value: String(s.totalShifts) },
                    { label: 'Hours', value: formatHours(s.totalHours) },
                    { label: 'Avg Rate', value: `${formatEuro(s.avgHourlyPay)}/h` },
                    { label: 'Earnings', value: formatEuro(s.totalEarnings) },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-[var(--text-muted)] text-xs mb-0.5">{label}</p>
                      <p className="text-[var(--text-primary)] font-semibold text-sm">{value}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Grand total */}
        <div className="glass-card p-4 flex items-center justify-between fade-up"
          style={{ borderColor: 'rgba(124,111,234,0.3)' }}>
          <span className="text-[var(--text-secondary)] font-medium text-sm">Grand Total</span>
          <span className="text-xl font-bold gradient-text">{formatEuro(grandTotal)}</span>
        </div>
      </div>
    </div>
  );
}
