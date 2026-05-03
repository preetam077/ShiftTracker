'use client';

import { useCallback, useEffect, useState } from 'react';
import { calculateEarnings, calculateHours } from '@/lib/calculations';
import { deleteShift, generateId, getShifts, saveShift, hasLegacyData, migrateLegacyData } from '@/lib/storage';
import { Shift } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';

export function useShifts() {
  const { user } = useAuth();
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [migrating, setMigrating] = useState(false);

  const load = useCallback(async () => {
    if (!user) {
      setShifts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const loaded = await getShifts(user.id);
      // Sort most recent first
      loaded.sort((a, b) => {
        if (b.date !== a.date) return b.date.localeCompare(a.date);
        return b.createdAt.localeCompare(a.createdAt);
      });
      setShifts(loaded);
    } catch (err) {
      console.error('Failed to load shifts:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Migrate legacy localStorage data on first load
  useEffect(() => {
    if (!user) return;
    if (!hasLegacyData()) return;

    setMigrating(true);
    migrateLegacyData(user.id)
      .then((count) => {
        if (count > 0) {
          console.log(`Migrated ${count} shifts from localStorage to Supabase`);
          load(); // Reload after migration
        }
      })
      .finally(() => setMigrating(false));
  }, [user, load]);

  useEffect(() => {
    load();
  }, [load]);

  const addShift = useCallback(
    async (data: Omit<Shift, 'id' | 'totalHours' | 'totalEarnings' | 'createdAt' | 'updatedAt'>) => {
      if (!user) return;
      const totalHours = calculateHours(data.startTime, data.endTime, data.breakMinutes ?? 0);
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
      await saveShift(shift, user.id);
      await load();
      return shift;
    },
    [user, load]
  );

  const updateShift = useCallback(
    async (
      id: string,
      data: Omit<Shift, 'id' | 'totalHours' | 'totalEarnings' | 'createdAt' | 'updatedAt'>
    ) => {
      if (!user) return;
      const existing = shifts.find((s) => s.id === id);
      if (!existing) return;
      const totalHours = calculateHours(data.startTime, data.endTime, data.breakMinutes ?? 0);
      const totalEarnings = calculateEarnings(totalHours, data.hourlyPay);
      const shift: Shift = {
        ...existing,
        ...data,
        id,
        totalHours,
        totalEarnings,
        updatedAt: new Date().toISOString(),
      };
      await saveShift(shift, user.id);
      await load();
      return shift;
    },
    [user, shifts, load]
  );

  const removeShift = useCallback(
    async (id: string) => {
      await deleteShift(id);
      await load();
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
    loading: loading || migrating,
    addShift,
    updateShift,
    removeShift,
    reload: load,
    getUniqueCompanies,
    getUniqueRoles,
  };
}
