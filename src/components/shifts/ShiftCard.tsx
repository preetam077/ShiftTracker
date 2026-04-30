'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Pencil, Trash2, ChevronDown, ChevronUp, Clock, Euro, Building2, StickyNote } from 'lucide-react';
import { formatDate, formatEuro, formatHours, getCompanyColor } from '@/lib/calculations';
import { Shift } from '@/lib/types';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

interface ShiftCardProps {
  shift: Shift;
  onDelete: (id: string) => void;
}

export function ShiftCard({ shift, onDelete }: ShiftCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const color = getCompanyColor(shift.company);

  return (
    <>
      <div className="glass-card p-4 transition-all duration-200 hover:shadow-lg hover:shadow-black/20">
        {/* Top row */}
        <div className="flex items-start gap-3">
          {/* Color dot */}
          <div
            className="w-3 h-3 rounded-full flex-shrink-0 mt-1.5"
            style={{ background: color, boxShadow: `0 0 8px ${color}60` }}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div>
                <p className="font-semibold text-[var(--text-primary)] text-sm">{shift.company}</p>
                <p className="text-[var(--text-muted)] text-xs mt-0.5">{shift.role}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-bold gradient-text text-base">{formatEuro(shift.totalEarnings)}</p>
                <p className="text-[var(--text-muted)] text-xs">{formatHours(shift.totalHours)}</p>
              </div>
            </div>

            {/* Chips row */}
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <span className="badge text-[var(--text-secondary)]" style={{ background: 'var(--bg-elevated)' }}>
                📅 {formatDate(shift.date)}
              </span>
              <span className="badge text-[var(--text-secondary)]" style={{ background: 'var(--bg-elevated)' }}>
                <Clock size={11} className="mr-1" />
                {shift.startTime} – {shift.endTime}
              </span>
              <span className="badge" style={{ background: `${color}15`, color }}>
                <Euro size={11} className="mr-1" />
                {shift.hourlyPay.toFixed(2)}/h
              </span>
            </div>
          </div>
        </div>

        {/* Expand (notes) */}
        {shift.notes && (
          <div className="mt-3 pl-6">
            <button
              className="btn-ghost py-1 px-2 text-xs"
              onClick={() => setExpanded((v) => !v)}
            >
              <StickyNote size={12} />
              Notes
              {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
            {expanded && (
              <p className="mt-2 text-[var(--text-secondary)] text-sm pl-1 pr-2 py-2 rounded-lg bg-[var(--bg-elevated)] fade-up">
                {shift.notes}
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-3 pl-6 pt-3 border-t border-[var(--border)]">
          <Link
            href={`/shifts/${shift.id}/edit`}
            className="btn-ghost py-1.5 px-3 text-xs"
          >
            <Pencil size={13} />
            Edit
          </Link>
          <button
            className="btn-danger py-1.5 px-3 text-xs"
            onClick={() => setConfirming(true)}
          >
            <Trash2 size={13} />
            Delete
          </button>
        </div>
      </div>

      {confirming && (
        <ConfirmModal
          title="Delete Shift"
          message={`Delete the shift at ${shift.company} on ${formatDate(shift.date)}? This cannot be undone.`}
          onConfirm={() => { onDelete(shift.id); setConfirming(false); }}
          onCancel={() => setConfirming(false)}
        />
      )}
    </>
  );
}
