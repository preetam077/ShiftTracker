import { Shift } from './types';

const STORAGE_KEY = 'shifttracker_shifts';

export function getShifts(): Shift[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Shift[];
  } catch {
    return [];
  }
}

export function saveShift(shift: Shift): void {
  const shifts = getShifts();
  const existingIndex = shifts.findIndex((s) => s.id === shift.id);
  if (existingIndex >= 0) {
    shifts[existingIndex] = shift;
  } else {
    shifts.push(shift);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(shifts));
}

export function deleteShift(id: string): void {
  const shifts = getShifts().filter((s) => s.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(shifts));
}

export function getShiftById(id: string): Shift | undefined {
  return getShifts().find((s) => s.id === id);
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
