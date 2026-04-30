'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useShifts } from '@/hooks/useShifts';
import { ShiftForm } from '@/components/shifts/ShiftForm';
import { Shift } from '@/lib/types';
import { getShiftById } from '@/lib/storage';

type ShiftFormData = Omit<Shift, 'id' | 'totalHours' | 'totalEarnings' | 'createdAt' | 'updatedAt'>;

export default function EditShiftPage() {
  const router = useRouter();
  const params = useParams();
  const { updateShift } = useShifts();
  const [shift, setShift] = useState<Shift | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const id = Array.isArray(params.id) ? params.id[0] : params.id;
    if (!id) { setNotFound(true); return; }
    const found = getShiftById(id);
    if (!found) { setNotFound(true); return; }
    setShift(found);
  }, [params.id]);

  const handleSubmit = (data: ShiftFormData) => {
    if (!shift) return;
    updateShift(shift.id, data);
    router.push('/shifts');
  };

  if (notFound) {
    return (
      <div className="glass-card p-10 text-center max-w-md mx-auto mt-10 fade-up">
        <p className="text-4xl mb-3">🔍</p>
        <p className="text-[var(--text-primary)] font-semibold">Shift not found</p>
        <button className="btn-secondary mt-4 text-sm" onClick={() => router.back()}>
          Go back
        </button>
      </div>
    );
  }

  if (!shift) {
    return (
      <div className="max-w-2xl mx-auto space-y-5 pt-10 lg:pt-0">
        <div className="h-10 shimmer rounded-xl" />
        <div className="h-64 shimmer rounded-xl" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5 pt-10 lg:pt-0">
      <div className="flex items-center gap-3 fade-up">
        <button className="btn-ghost p-2 rounded-xl" onClick={() => router.back()}>
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Edit Shift</h1>
          <p className="text-[var(--text-muted)] text-sm">{shift.company} · {shift.role}</p>
        </div>
      </div>
      <div className="fade-up fade-up-delay-1">
        <ShiftForm initialData={shift} onSubmit={handleSubmit} isEdit />
      </div>
    </div>
  );
}
