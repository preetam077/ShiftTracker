'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Pencil,
  Trash2,
  LayoutGrid,
  Table,
  GripVertical,
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

/* Column definition */
interface ColumnDef {
  id: string;
  label: string;
  sortField?: SortField;
  draggable: boolean;
}

const DEFAULT_COLUMNS: ColumnDef[] = [
  { id: 'date', label: 'Date', sortField: 'date', draggable: true },
  { id: 'company', label: 'Company', sortField: 'company', draggable: true },
  { id: 'role', label: 'Role', draggable: true },
  { id: 'time', label: 'Time', draggable: true },
  { id: 'hours', label: 'Hours', sortField: 'totalHours', draggable: true },
  { id: 'rate', label: 'Rate', draggable: true },
  { id: 'earnings', label: 'Earnings', sortField: 'totalEarnings', draggable: true },
  { id: 'actions', label: 'Actions', draggable: false },
];

const STORAGE_KEY = 'shift-table-column-order';

function getStoredOrder(): string[] | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return null;
    // Validate all IDs are present
    const defaultIds = DEFAULT_COLUMNS.map((c) => c.id);
    if (parsed.length !== defaultIds.length) return null;
    if (!parsed.every((id: string) => defaultIds.includes(id))) return null;
    return parsed;
  } catch {
    return null;
  }
}

function saveOrder(order: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(order));
  } catch {
    // ignore
  }
}

/* Sort indicator icon */
function SortIcon({ field, sortField, sortDirection }: { field: SortField; sortField: SortField; sortDirection: 'asc' | 'desc' }) {
  if (sortField !== field) return <ArrowUpDown size={13} className="opacity-30" />;
  return sortDirection === 'asc' ? <ArrowUp size={13} className="text-[var(--accent-purple)]" /> : <ArrowDown size={13} className="text-[var(--accent-purple)]" />;
}

/* Render a cell's content for a given column and shift */
function CellContent({ colId, shift, onDeleteClick }: { colId: string; shift: Shift; onDeleteClick: () => void }) {
  const color = getCompanyColor(shift.company);
  switch (colId) {
    case 'date':
      return <td className="px-4 py-3 text-[var(--text-secondary)] whitespace-nowrap">{formatDate(shift.date)}</td>;
    case 'company':
      return (
        <td className="px-4 py-3">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
            <span className="text-[var(--text-primary)] font-medium">{shift.company}</span>
          </span>
        </td>
      );
    case 'role':
      return <td className="px-4 py-3 text-[var(--text-secondary)] max-w-[140px] truncate">{shift.role}</td>;
    case 'time':
      return <td className="px-4 py-3 text-[var(--text-secondary)] whitespace-nowrap">{shift.startTime} – {shift.endTime}</td>;
    case 'hours':
      return <td className="px-4 py-3 text-[var(--text-primary)] font-medium whitespace-nowrap">{formatHours(shift.totalHours)}</td>;
    case 'rate':
      return <td className="px-4 py-3 text-[var(--text-secondary)] whitespace-nowrap">{formatEuro(shift.hourlyPay)}/h</td>;
    case 'earnings':
      return (
        <td className="px-4 py-3 whitespace-nowrap">
          <span className="font-bold gradient-text">{formatEuro(shift.totalEarnings)}</span>
        </td>
      );
    case 'actions':
      return (
        <td className="px-4 py-3">
          <div className="flex items-center gap-1">
            <Link href={`/shifts/edit?id=${shift.id}`} className="btn-ghost p-1.5 rounded-lg" title="Edit">
              <Pencil size={14} />
            </Link>
            <button className="btn-danger p-1.5 rounded-lg" title="Delete" onClick={onDeleteClick}>
              <Trash2 size={14} />
            </button>
          </div>
        </td>
      );
    default:
      return <td />;
  }
}

export function ShiftList({ shifts, onDelete, sortField, sortDirection, onSort }: ShiftListProps) {
  const [view, setView] = useState<'table' | 'grid'>('table');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Column ordering state
  const [columnOrder, setColumnOrder] = useState<string[]>(() => {
    const stored = getStoredOrder();
    return stored || DEFAULT_COLUMNS.map((c) => c.id);
  });
  const [draggedCol, setDraggedCol] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);
  const dragCounterRef = useRef<Record<string, number>>({});

  // Persist column order
  useEffect(() => {
    saveOrder(columnOrder);
  }, [columnOrder]);

  const orderedColumns = columnOrder.map((id) => DEFAULT_COLUMNS.find((c) => c.id === id)!);

  const handleDragStart = useCallback((e: React.DragEvent, colId: string) => {
    setDraggedCol(colId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', colId);
    // Slight delay to allow the browser to snapshot before adding styles
    requestAnimationFrame(() => {
      const el = document.querySelector(`[data-col-header="${colId}"]`) as HTMLElement;
      if (el) el.style.opacity = '0.4';
    });
  }, []);

  const handleDragEnd = useCallback(() => {
    // Reset opacity
    if (draggedCol) {
      const el = document.querySelector(`[data-col-header="${draggedCol}"]`) as HTMLElement;
      if (el) el.style.opacity = '1';
    }
    setDraggedCol(null);
    setDragOverCol(null);
    dragCounterRef.current = {};
  }, [draggedCol]);

  const handleDragEnter = useCallback((e: React.DragEvent, colId: string) => {
    e.preventDefault();
    if (!dragCounterRef.current[colId]) dragCounterRef.current[colId] = 0;
    dragCounterRef.current[colId]++;
    if (colId !== draggedCol) {
      setDragOverCol(colId);
    }
  }, [draggedCol]);

  const handleDragLeave = useCallback((colId: string) => {
    if (!dragCounterRef.current[colId]) dragCounterRef.current[colId] = 0;
    dragCounterRef.current[colId]--;
    if (dragCounterRef.current[colId] <= 0) {
      dragCounterRef.current[colId] = 0;
      if (dragOverCol === colId) {
        setDragOverCol(null);
      }
    }
  }, [dragOverCol]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetColId: string) => {
    e.preventDefault();
    const sourceColId = e.dataTransfer.getData('text/plain');
    if (!sourceColId || sourceColId === targetColId) {
      handleDragEnd();
      return;
    }

    setColumnOrder((prev) => {
      const newOrder = [...prev];
      const sourceIdx = newOrder.indexOf(sourceColId);
      const targetIdx = newOrder.indexOf(targetColId);
      if (sourceIdx === -1 || targetIdx === -1) return prev;
      newOrder.splice(sourceIdx, 1);
      newOrder.splice(targetIdx, 0, sourceColId);
      return newOrder;
    });
    handleDragEnd();
  }, [handleDragEnd]);

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
                  {orderedColumns.map((col) => {
                    const isDragTarget = dragOverCol === col.id && draggedCol !== col.id;
                    return (
                      <th
                        key={col.id}
                        data-col-header={col.id}
                        draggable={col.draggable}
                        onDragStart={col.draggable ? (e) => handleDragStart(e, col.id) : undefined}
                        onDragEnd={handleDragEnd}
                        onDragEnter={(e) => handleDragEnter(e, col.id)}
                        onDragLeave={() => handleDragLeave(col.id)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, col.id)}
                        className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] select-none whitespace-nowrap transition-all ${
                          col.sortField ? 'cursor-pointer hover:text-[var(--text-primary)]' : ''
                        } ${col.draggable ? 'cursor-grab active:cursor-grabbing' : ''} ${
                          isDragTarget ? 'bg-[var(--accent-purple)]/10 border-l-2 border-l-[var(--accent-purple)]' : ''
                        }`}
                        onClick={col.sortField ? () => onSort(col.sortField!) : undefined}
                        style={{
                          borderLeft: isDragTarget ? '2px solid var(--accent-purple)' : undefined,
                          background: isDragTarget ? 'rgba(139, 92, 246, 0.08)' : undefined,
                        }}
                      >
                        <span className="flex items-center gap-1.5">
                          {col.draggable && (
                            <GripVertical size={12} className="opacity-30 hover:opacity-70 flex-shrink-0 transition-opacity" />
                          )}
                          {col.label}
                          {col.sortField && (
                            <SortIcon field={col.sortField} sortField={sortField} sortDirection={sortDirection} />
                          )}
                        </span>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {shifts.map((s, i) => (
                  <tr
                    key={s.id}
                    className="border-b border-[var(--border)] hover:bg-[var(--bg-elevated)] transition-colors"
                    style={{ animationDelay: `${i * 30}ms` }}
                  >
                    {orderedColumns.map((col) => (
                      <CellContent
                        key={col.id}
                        colId={col.id}
                        shift={s}
                        onDeleteClick={() => setDeletingId(s.id)}
                      />
                    ))}
                  </tr>
                ))}
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
