'use client';

import { useCallback, useEffect, useState } from 'react';
import { calculateEarnings, calculateHours } from '@/lib/calculations';
import { deleteShift, generateId, getShifts, saveShift } from '@/lib/storage';
import { Shift } from '@/lib/types';

export function useShifts() {
  const [shifts, setShifts] = useState<Shift[]>([]);

  const load = useCallback(() => {
    const loaded = getShifts();
    // Sort most recent first
    loaded.sort((a, b) => {
      if (b.date !== a.date) return b.date.localeCompare(a.date);
      return b.createdAt.localeCompare(a.createdAt);
    });
    setShifts(loaded);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const addShift = useCallback(
    (data: Omit<Shift, 'id' | 'totalHours' | 'totalEarnings' | 'createdAt' | 'updatedAt'>) => {
      const totalHours = calculateHours(data.startTime, data.endTime);
      const totalEarnings = calculateEarnings(totalHours, data.hourlyPay);
      const now = new Date().toISOString();
      const shift: Shift = {
        ...data,
        id: generateId(),
        totalHours,
        totalEarnings,
        createdAt: now,
        updatedAt: now,
      };
      saveShift(shift);
      load();
      return shift;
    },
    [load]
  );

  const updateShift = useCallback(
    (
      id: string,
      data: Omit<Shift, 'id' | 'totalHours' | 'totalEarnings' | 'createdAt' | 'updatedAt'>
    ) => {
      const existing = getShifts().find((s) => s.id === id);
      if (!existing) return;
      const totalHours = calculateHours(data.startTime, data.endTime);
      const totalEarnings = calculateEarnings(totalHours, data.hourlyPay);
      const shift: Shift = {
        ...existing,
        ...data,
        id,
        totalHours,
        totalEarnings,
        updatedAt: new Date().toISOString(),
      };
      saveShift(shift);
      load();
      return shift;
    },
    [load]
  );

  const removeShift = useCallback(
    (id: string) => {
      deleteShift(id);
      load();
    },
    [load]
  );

  const getUniqueCompanies = useCallback(() => {
    return [...new Set(shifts.map((s) => s.company))].sort();
  }, [shifts]);

  const getUniqueRoles = useCallback(() => {
    return [...new Set(shifts.map((s) => s.role))].sort();
  }, [shifts]);

  return {
    shifts,
    addShift,
    updateShift,
    removeShift,
    reload: load,
    getUniqueCompanies,
    getUniqueRoles,
  };
}
