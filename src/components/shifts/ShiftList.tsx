'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Pencil,
  Trash2,
  LayoutGrid,
  Table,
} from 'lucide-react';
import { formatDate, formatEuro, formatHours, getCompanyColor } from '@/lib/calculations';
import { Shift, SortField } from '@/lib/types';
import { ShiftCard } from './ShiftCard';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

interface ShiftListProps {
  shifts: Shift[];
  onDelete: (id: string) => void;
  sortField: SortField;
  sortDirection: 'asc' | 'desc';
  onSort: (field: SortField) => void;
}

/* Sort indicator icon — stable component defined outside render */
function SortIcon({ field, sortField, sortDirection }: { field: SortField; sortField: SortField; sortDirection: 'asc' | 'desc' }) {
  if (sortField !== field) return <ArrowUpDown size={13} className="opacity-30" />;
  return sortDirection === 'asc' ? <ArrowUp size={13} className="text-[var(--accent-purple)]" /> : <ArrowDown size={13} className="text-[var(--accent-purple)]" />;
}

/* Sortable header cell — stable component defined outside render */
function SortableTh({ field, label, className = '', sortField, sortDirection, onSort }: {
  field: SortField;
  label: string;
  className?: string;
  sortField: SortField;
  sortDirection: 'asc' | 'desc';
  onSort: (field: SortField) => void;
}) {
  return (
    <th
      className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] cursor-pointer select-none whitespace-nowrap hover:text-[var(--text-primary)] transition-colors ${className}`}
      onClick={() => onSort(field)}
    >
      <span className="flex items-center gap-1.5">
        {label}
        <SortIcon field={field} sortField={sortField} sortDirection={sortDirection} />
      </span>
    </th>
  );
}

export function ShiftList({ shifts, onDelete, sortField, sortDirection, onSort }: ShiftListProps) {
  const [view, setView] = useState<'table' | 'grid'>('table');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (shifts.length === 0) {
    return (
      <div className="glass-card p-12 text-center fade-up">
        <p className="text-5xl mb-4">📋</p>
        <p className="text-[var(--text-primary)] font-semibold mb-1">No shifts found</p>
        <p className="text-[var(--text-muted)] text-sm mb-5">
          Try adjusting your filters or add a new shift
        </p>
        <Link href="/shifts/new" className="btn-primary text-sm">
          Add Shift
        </Link>
      </div>
    );
  }

  const deleting = deletingId ? shifts.find((s) => s.id === deletingId) : null;

  return (
    <>
      {/* View toggle */}
      <div className="flex justify-end gap-2 mb-3">
        <button
          className={`btn-ghost py-1.5 px-3 text-xs ${view === 'table' ? 'bg-[var(--bg-elevated)] text-[var(--text-primary)]' : ''}`}
          onClick={() => setView('table')}
        >
          <Table size={14} /> Table
        </button>
        <button
          className={`btn-ghost py-1.5 px-3 text-xs ${view === 'grid' ? 'bg-[var(--bg-elevated)] text-[var(--text-primary)]' : ''}`}
          onClick={() => setView('grid')}
        >
          <LayoutGrid size={14} /> Cards
        </button>
      </div>

      {/* Table view */}
      {view === 'table' && (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <SortableTh field="date" label="Date" sortField={sortField} sortDirection={sortDirection} onSort={onSort} />
                  <SortableTh field="company" label="Company" sortField={sortField} sortDirection={sortDirection} onSort={onSort} />
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Role</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Time</th>
                  <SortableTh field="totalHours" label="Hours" sortField={sortField} sortDirection={sortDirection} onSort={onSort} />
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Rate</th>
                  <SortableTh field="totalEarnings" label="Earnings" sortField={sortField} sortDirection={sortDirection} onSort={onSort} />
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {shifts.map((s, i) => {
                  const color = getCompanyColor(s.company);
                  return (
                    <tr
                      key={s.id}
                      className="border-b border-[var(--border)] hover:bg-[var(--bg-elevated)] transition-colors"
                      style={{ animationDelay: `${i * 30}ms` }}
                    >
                      <td className="px-4 py-3 text-[var(--text-secondary)] whitespace-nowrap">
                        {formatDate(s.date)}
                      </td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                          <span className="text-[var(--text-primary)] font-medium">{s.company}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[var(--text-secondary)] max-w-[140px] truncate">{s.role}</td>
                      <td className="px-4 py-3 text-[var(--text-secondary)] whitespace-nowrap">
                        {s.startTime} – {s.endTime}
                      </td>
                      <td className="px-4 py-3 text-[var(--text-primary)] font-medium whitespace-nowrap">
                        {formatHours(s.totalHours)}
                      </td>
                      <td className="px-4 py-3 text-[var(--text-secondary)] whitespace-nowrap">
                        {formatEuro(s.hourlyPay)}/h
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="font-bold gradient-text">{formatEuro(s.totalEarnings)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Link href={`/shifts/edit?id=${s.id}`} className="btn-ghost p-1.5 rounded-lg" title="Edit">
                            <Pencil size={14} />
                          </Link>
                          <button
                            className="btn-danger p-1.5 rounded-lg"
                            title="Delete"
                            onClick={() => setDeletingId(s.id)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Grid / card view */}
      {view === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {shifts.map((s) => (
            <ShiftCard key={s.id} shift={s} onDelete={onDelete} />
          ))}
        </div>
      )}

      {/* Confirm modal */}
      {deleting && (
        <ConfirmModal
          title="Delete Shift"
          message={`Delete the shift at ${deleting.company} on ${formatDate(deleting.date)}? This cannot be undone.`}
          onConfirm={() => { onDelete(deleting.id); setDeletingId(null); }}
          onCancel={() => setDeletingId(null)}
        />
      )}
    </>
  );
}
