'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useShifts } from '@/hooks/useShifts';
import { ShiftForm } from '@/components/shifts/ShiftForm';
import { Shift } from '@/lib/types';

type ShiftFormData = Omit<Shift, 'id' | 'totalHours' | 'totalEarnings' | 'createdAt' | 'updatedAt'>;

export default function NewShiftPage() {
  const router = useRouter();
  const { addShift } = useShifts();

  const handleSubmit = async (data: ShiftFormData) => {
    await addShift(data);
    router.push('/shifts');
  };

  const handleSubmitAndAdd = async (data: ShiftFormData) => {
    await addShift(data);
    // Soft-refresh same page by pushing same route
    router.refresh();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5 pt-10 lg:pt-0">
      <div className="flex items-center gap-3 fade-up">
        <button
          className="btn-ghost p-2 rounded-xl"
          onClick={() => router.back()}
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Add Shift</h1>
          <p className="text-[var(--text-muted)] text-sm">Log a new work shift</p>
        </div>
      </div>
      <div className="fade-up fade-up-delay-1">
        <ShiftForm
          onSubmit={handleSubmit}
          onSubmitAndAdd={handleSubmitAndAdd}
        />
      </div>
    </div>
  );
}
