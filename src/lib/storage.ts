import { supabase } from './supabase';
import { Shift } from './types';

// ---------- helpers ----------

interface ShiftRow {
  id: string;
  user_id: string;
  date: string;
  company: string;
  role: string;
  start_time: string;
  end_time: string;
  break_minutes: number;
  hourly_pay: number;
  total_hours: number;
  total_earnings: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

function rowToShift(row: ShiftRow): Shift {
  return {
    id: row.id,
    date: row.date,
    company: row.company,
    role: row.role,
    startTime: row.start_time,
    endTime: row.end_time,
    breakMinutes: row.break_minutes ?? 0,
    hourlyPay: row.hourly_pay,
    totalHours: row.total_hours,
    totalEarnings: row.total_earnings,
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function shiftToRow(shift: Shift, userId: string): Omit<ShiftRow, 'created_at' | 'updated_at'> & { created_at?: string; updated_at?: string } {
  return {
    id: shift.id,
    user_id: userId,
    date: shift.date,
    company: shift.company,
    role: shift.role,
    start_time: shift.startTime,
    end_time: shift.endTime,
    break_minutes: shift.breakMinutes ?? 0,
    hourly_pay: shift.hourlyPay,
    total_hours: shift.totalHours,
    total_earnings: shift.totalEarnings,
    notes: shift.notes ?? null,
    created_at: shift.createdAt,
    updated_at: shift.updatedAt,
  };
}

// ---------- CRUD ----------

export async function getShifts(userId: string): Promise<Shift[]> {
  const { data, error } = await supabase
    .from('shifts')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching shifts:', error);
    return [];
  }

  return (data as ShiftRow[]).map(rowToShift);
}

export async function saveShift(shift: Shift, userId: string): Promise<void> {
  const row = shiftToRow(shift, userId);
  const { error } = await supabase
    .from('shifts')
    .upsert(row, { onConflict: 'id' });

  if (error) {
    console.error('Error saving shift:', error);
    throw error;
  }
}

export async function deleteShift(id: string): Promise<void> {
  const { error } = await supabase
    .from('shifts')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting shift:', error);
    throw error;
  }
}

export async function getShiftById(id: string, userId: string): Promise<Shift | undefined> {
  const { data, error } = await supabase
    .from('shifts')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single();

  if (error || !data) return undefined;
  return rowToShift(data as ShiftRow);
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// ---------- Migration ----------

const LEGACY_STORAGE_KEY = 'shifttracker_shifts';
const MIGRATION_KEY = 'shifttracker_migrated';

export function getLegacyShifts(): Shift[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Shift[];
  } catch {
    return [];
  }
}

export function hasLegacyData(): boolean {
  if (typeof window === 'undefined') return false;
  const migrated = localStorage.getItem(MIGRATION_KEY);
  if (migrated) return false;
  const raw = localStorage.getItem(LEGACY_STORAGE_KEY);
  return !!raw && JSON.parse(raw).length > 0;
}

export async function migrateLegacyData(userId: string): Promise<number> {
  const legacy = getLegacyShifts();
  if (legacy.length === 0) return 0;

  let migrated = 0;
  for (const shift of legacy) {
    try {
      await saveShift(shift, userId);
      migrated++;
    } catch (err) {
      console.error('Failed to migrate shift:', shift.id, err);
    }
  }

  // Mark as migrated so we don't try again
  localStorage.setItem(MIGRATION_KEY, 'true');
  return migrated;
}
