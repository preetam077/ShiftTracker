'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Briefcase,
  Building2,
  CalendarDays,
  Clock,
  Euro,
  FileText,
  Save,
  Plus,
} from 'lucide-react';
import { calculateEarnings, calculateHours, formatEuro, todayISO } from '@/lib/calculations';
import { Shift } from '@/lib/types';

type ShiftFormData = Omit<Shift, 'id' | 'totalHours' | 'totalEarnings' | 'createdAt' | 'updatedAt'>;

interface ShiftFormProps {
  initialData?: Shift;
  onSubmit: (data: ShiftFormData) => void;
  onSubmitAndAdd?: (data: ShiftFormData) => void;
  isEdit?: boolean;
}

interface FormErrors {
  date?: string;
  company?: string;
  role?: string;
  startTime?: string;
  endTime?: string;
  hourlyPay?: string;
}

export function ShiftForm({ initialData, onSubmit, onSubmitAndAdd, isEdit }: ShiftFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<ShiftFormData>({
    date: initialData?.date ?? todayISO(),
    company: initialData?.company ?? '',
    role: initialData?.role ?? '',
    startTime: initialData?.startTime ?? '',
    endTime: initialData?.endTime ?? '',
    hourlyPay: initialData?.hourlyPay ?? 0,
    notes: initialData?.notes ?? '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [preview, setPreview] = useState({ hours: 0, earnings: 0, valid: false });

  useEffect(() => {
    if (form.startTime && form.endTime) {
      const h = calculateHours(form.startTime, form.endTime);
      const e = calculateEarnings(h, form.hourlyPay || 0);
      setPreview({ hours: h, earnings: e, valid: h > 0 });
    } else {
      setPreview({ hours: 0, earnings: 0, valid: false });
    }
  }, [form.startTime, form.endTime, form.hourlyPay]);

  const set = (field: keyof ShiftFormData, value: string | number) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const validate = (): boolean => {
    const errs: FormErrors = {};
    if (!form.date) errs.date = 'Date is required';
    if (!form.company.trim()) errs.company = 'Company is required';
    if (!form.role.trim()) errs.role = 'Role is required';
    if (!form.startTime) errs.startTime = 'Start time is required';
    if (!form.endTime) errs.endTime = 'End time is required';
    if (!form.hourlyPay || form.hourlyPay <= 0) errs.hourlyPay = 'Must be a positive number';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (mode: 'save' | 'add') => {
    if (!validate()) return;
    if (mode === 'add' && onSubmitAndAdd) {
      onSubmitAndAdd(form);
    } else {
      onSubmit(form);
    }
  };

  return (
    <div className="glass-card p-6 md:p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Date */}
        <div>
          <div className="flex items-center gap-1.5 text-[var(--text-secondary)] text-sm font-medium mb-1.5">
            <span className="text-[var(--accent-purple)]"><CalendarDays size={14} /></span>
            <span>Work Date</span>
          </div>
          <input
            id="shift-date"
            type="date"
            className="input-base"
            value={form.date}
            onChange={(e) => set('date', e.target.value)}
          />
          {errors.date && <p className="text-red-400 text-xs mt-1">{errors.date}</p>}
        </div>

        {/* Company */}
        <div>
          <div className="flex items-center gap-1.5 text-[var(--text-secondary)] text-sm font-medium mb-1.5">
            <span className="text-[var(--accent-purple)]"><Building2 size={14} /></span>
            <span>Company</span>
          </div>
          <input
            id="shift-company"
            type="text"
            className="input-base"
            placeholder="e.g. DHL, Restaurant A"
            value={form.company}
            onChange={(e) => set('company', e.target.value)}
          />
          {errors.company && <p className="text-red-400 text-xs mt-1">{errors.company}</p>}
        </div>

        {/* Role */}
        <div>
          <div className="flex items-center gap-1.5 text-[var(--text-secondary)] text-sm font-medium mb-1.5">
            <span className="text-[var(--accent-purple)]"><Briefcase size={14} /></span>
            <span>Job Role / Position</span>
          </div>
          <input
            id="shift-role"
            type="text"
            className="input-base"
            placeholder="e.g. Kitchen Assistant"
            value={form.role}
            onChange={(e) => set('role', e.target.value)}
          />
          {errors.role && <p className="text-red-400 text-xs mt-1">{errors.role}</p>}
        </div>

        {/* Hourly Pay */}
        <div>
          <div className="flex items-center gap-1.5 text-[var(--text-secondary)] text-sm font-medium mb-1.5">
            <span className="text-[var(--accent-purple)]"><Euro size={14} /></span>
            <span>Hourly Pay (€)</span>
          </div>
          <input
            id="shift-hourly-pay"
            type="number"
            min="0"
            step="0.01"
            className="input-base"
            placeholder="e.g. 14.50"
            value={form.hourlyPay || ''}
            onChange={(e) => set('hourlyPay', parseFloat(e.target.value) || 0)}
          />
          {errors.hourlyPay && <p className="text-red-400 text-xs mt-1">{errors.hourlyPay}</p>}
        </div>

        {/* Start Time */}
        <div>
          <div className="flex items-center gap-1.5 text-[var(--text-secondary)] text-sm font-medium mb-1.5">
            <span className="text-[var(--accent-purple)]"><Clock size={14} /></span>
            <span>Start Time</span>
          </div>
          <input
            id="shift-start-time"
            type="time"
            className="input-base"
            value={form.startTime}
            onChange={(e) => set('startTime', e.target.value)}
          />
          {errors.startTime && <p className="text-red-400 text-xs mt-1">{errors.startTime}</p>}
        </div>

        {/* End Time */}
        <div>
          <div className="flex items-center gap-1.5 text-[var(--text-secondary)] text-sm font-medium mb-1.5">
            <span className="text-[var(--accent-purple)]"><Clock size={14} /></span>
            <span>End Time</span>
          </div>
          <input
            id="shift-end-time"
            type="time"
            className="input-base"
            value={form.endTime}
            onChange={(e) => set('endTime', e.target.value)}
          />
          {errors.endTime && <p className="text-red-400 text-xs mt-1">{errors.endTime}</p>}
        </div>

        {/* Notes — full width */}
        <div className="md:col-span-2">
          <div className="flex items-center gap-1.5 text-[var(--text-secondary)] text-sm font-medium mb-1.5">
            <span className="text-[var(--accent-purple)]"><FileText size={14} /></span>
            <span>Notes (optional)</span>
          </div>
          <textarea
            id="shift-notes"
            className="input-base resize-none"
            rows={3}
            placeholder="Any additional notes..."
            value={form.notes ?? ''}
            onChange={(e) => set('notes', e.target.value)}
          />
        </div>
      </div>

      {/* Live Preview */}
      {preview.valid && (
        <div className="mt-5 p-4 rounded-xl fade-up"
          style={{ background: 'linear-gradient(135deg, rgba(124,111,234,0.12), rgba(18,216,192,0.08))', border: '1px solid rgba(124,111,234,0.2)' }}>
          <p className="text-[var(--text-muted)] text-xs font-semibold uppercase tracking-wider mb-3">
            Live Preview
          </p>
          <div className="flex flex-wrap gap-6">
            <div>
              <p className="text-[var(--text-muted)] text-xs">Total Hours</p>
              <p className="text-[var(--accent-teal)] font-bold text-xl">
                {preview.hours.toFixed(2)}h
              </p>
            </div>
            <div>
              <p className="text-[var(--text-muted)] text-xs">Earnings</p>
              <p className="font-bold text-xl gradient-text">
                {formatEuro(preview.earnings)}
              </p>
            </div>
            {form.startTime && form.endTime && form.endTime <= form.startTime && (
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <p className="text-amber-400 text-xs">Crosses midnight</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="mt-6 flex flex-wrap gap-3 justify-end">
        <button
          className="btn-secondary"
          onClick={() => router.back()}
        >
          Cancel
        </button>
        {!isEdit && onSubmitAndAdd && (
          <button
            id="save-add-another"
            className="btn-secondary"
            onClick={() => handleSubmit('add')}
          >
            <Plus size={16} />
            Save &amp; Add Another
          </button>
        )}
        <button
          id="save-shift"
          className="btn-primary"
          onClick={() => handleSubmit('save')}
        >
          <Save size={16} />
          {isEdit ? 'Update Shift' : 'Save Shift'}
        </button>
      </div>
    </div>
  );
}
