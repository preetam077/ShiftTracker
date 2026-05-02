'use client';

import { ChevronLeft, ChevronRight, Filter, X } from 'lucide-react';
import { FilterState, SortField } from '@/lib/types';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

interface FilterControlsProps {
  filters: FilterState;
  companies: string[];
  roles: string[];
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
  onCompanyChange: (company: string) => void;
  onRoleChange: (role: string) => void;
  onSort: (field: SortField) => void;
  onReset: () => void;
  totalResults: number;
}

export function FilterControls({
  filters,
  companies,
  roles,
  onMonthChange,
  onYearChange,
  onCompanyChange,
  onRoleChange,
  onReset,
  totalResults,
}: FilterControlsProps) {
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
  const hasActiveFilters = filters.company !== '' || filters.role !== '';

  const prevMonth = () => {
    if (filters.month === 1) { onMonthChange(12); onYearChange(filters.year - 1); }
    else onMonthChange(filters.month - 1);
  };
  const nextMonth = () => {
    if (filters.month === 12) { onMonthChange(1); onYearChange(filters.year + 1); }
    else onMonthChange(filters.month + 1);
  };

  return (
    <div className="glass-card p-4 mb-5">
      <div className="flex flex-wrap gap-3 items-center">
        {/* Month navigator */}
        <div className="flex items-center gap-1 bg-[var(--bg-elevated)] rounded-xl p-1">
          <button onClick={prevMonth} className="btn-ghost p-1.5 rounded-lg">
            <ChevronLeft size={16} />
          </button>
          <select
            className="bg-transparent border-none text-[var(--text-primary)] font-medium text-sm cursor-pointer outline-none px-1"
            value={filters.month}
            onChange={(e) => onMonthChange(Number(e.target.value))}
          >
            {MONTHS.map((m, i) => (
              <option key={m} value={i + 1} style={{ background: 'var(--option-bg)' }}>{m}</option>
            ))}
          </select>
          <select
            className="bg-transparent border-none text-[var(--text-primary)] font-medium text-sm cursor-pointer outline-none px-1"
            value={filters.year}
            onChange={(e) => onYearChange(Number(e.target.value))}
          >
            {years.map((y) => (
              <option key={y} value={y} style={{ background: 'var(--option-bg)' }}>{y}</option>
            ))}
          </select>
          <button onClick={nextMonth} className="btn-ghost p-1.5 rounded-lg">
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Company filter */}
        {companies.length > 0 && (
          <select
            className="input-base w-auto min-w-[140px] py-2 text-sm"
            value={filters.company}
            onChange={(e) => onCompanyChange(e.target.value)}
          >
            <option value="">All Companies</option>
            {companies.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        )}

        {/* Role filter */}
        {roles.length > 0 && (
          <select
            className="input-base w-auto min-w-[140px] py-2 text-sm"
            value={filters.role}
            onChange={(e) => onRoleChange(e.target.value)}
          >
            <option value="">All Roles</option>
            {roles.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        )}

        {/* Reset */}
        {hasActiveFilters && (
          <button onClick={onReset} className="btn-ghost py-2 px-3 text-xs text-[var(--accent-teal)]">
            <X size={13} />
            Clear filters
          </button>
        )}

        {/* Result count */}
        <span className="ml-auto text-[var(--text-muted)] text-xs flex items-center gap-1.5">
          <Filter size={12} />
          {totalResults} shift{totalResults !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  );
}
