export interface Shift {
  id: string;
  date: string; // YYYY-MM-DD
  company: string;
  role: string;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  hourlyPay: number;
  totalHours: number;
  totalEarnings: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MonthlyStats {
  totalDays: number;
  totalHours: number;
  totalEarnings: number;
  totalShifts: number;
  avgHourlyPay: number;
  companySummaries: CompanySummary[];
  dailyEarnings: DailyEarning[];
}

export interface CompanySummary {
  company: string;
  totalShifts: number;
  totalHours: number;
  avgHourlyPay: number;
  totalEarnings: number;
  color: string;
}

export interface DailyEarning {
  date: string; // DD.MM
  earnings: number;
  hours: number;
}

export type SortField = 'date' | 'company' | 'totalHours' | 'totalEarnings';
export type SortDirection = 'asc' | 'desc';

export interface FilterState {
  month: number; // 1-12
  year: number;
  company: string; // '' = all
  role: string; // '' = all
  sortField: SortField;
  sortDirection: SortDirection;
}
