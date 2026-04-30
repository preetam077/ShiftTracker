'use client';

import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  title,
  message,
  confirmLabel = 'Delete',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onCancel}
      />
      {/* Dialog */}
      <div className="relative glass-card p-6 w-full max-w-sm fade-up">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 btn-ghost p-1.5 rounded-lg"
        >
          <X size={16} />
        </button>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-red-500/15 flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={20} className="text-red-400" />
          </div>
          <h2 className="font-semibold text-[var(--text-primary)] text-base">{title}</h2>
        </div>
        <p className="text-[var(--text-secondary)] text-sm mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="btn-secondary text-sm px-4 py-2">
            Cancel
          </button>
          <button onClick={onConfirm} className="btn-danger text-sm px-4 py-2">
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
