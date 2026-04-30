import { CompanySummary, DailyEarning, MonthlyStats, Shift } from './types';

// ---------------------------------------------------------------------------
// Time / hour calculations
// ---------------------------------------------------------------------------

export function calculateHours(startTime: string, endTime: string): number {
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);
  let startMinutes = sh * 60 + sm;
  let endMinutes = eh * 60 + em;
  // Handle midnight crossover
  if (endMinutes <= startMinutes) {
    endMinutes += 24 * 60;
  }
  return parseFloat(((endMinutes - startMinutes) / 60).toFixed(2));
}

export function calculateEarnings(totalHours: number, hourlyPay: number): number {
  return parseFloat((totalHours * hourlyPay).toFixed(2));
}

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------

export function formatEuro(value: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(value);
}

export function formatHours(value: number): string {
  const h = Math.floor(value);
  const m = Math.round((value - h) * 60);
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function formatDate(dateStr: string): string {
  // Input: YYYY-MM-DD → DD.MM.YYYY
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${d}.${m}.${y}`;
}

export function todayISO(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// ---------------------------------------------------------------------------
// Company color palette
// ---------------------------------------------------------------------------

const COMPANY_COLORS = [
  '#6366f1', // indigo
  '#14b8a6', // teal
  '#f59e0b', // amber
  '#ec4899', // pink
  '#8b5cf6', // violet
  '#22c55e', // green
  '#f97316', // orange
  '#06b6d4', // cyan
];

const colorMap: Record<string, string> = {};
let colorIndex = 0;

export function getCompanyColor(company: string): string {
  if (!colorMap[company]) {
    colorMap[company] = COMPANY_COLORS[colorIndex % COMPANY_COLORS.length];
    colorIndex++;
  }
  return colorMap[company];
}

// ---------------------------------------------------------------------------
// Monthly aggregations
// ---------------------------------------------------------------------------

export function getShiftsForMonth(shifts: Shift[], month: number, year: number): Shift[] {
  return shifts.filter((s) => {
    const [y, m] = s.date.split('-').map(Number);
    return y === year && m === month;
  });
}

export function getMonthlyStats(shifts: Shift[], month: number, year: number): MonthlyStats {
  const monthShifts = getShiftsForMonth(shifts, month, year);

  const totalShifts = monthShifts.length;
  const totalHours = parseFloat(
    monthShifts.reduce((acc, s) => acc + s.totalHours, 0).toFixed(2)
  );
  const totalEarnings = parseFloat(
    monthShifts.reduce((acc, s) => acc + s.totalEarnings, 0).toFixed(2)
  );
  const uniqueDays = new Set(monthShifts.map((s) => s.date)).size;

  // Group shifts by date and sum hours per day to classify FT vs PT
  const hoursPerDay: Record<string, number> = {};
  for (const s of monthShifts) {
    hoursPerDay[s.date] = (hoursPerDay[s.date] || 0) + s.totalHours;
  }
  let fullTimeDays = 0;
  let partTimeDays = 0;
  for (const hours of Object.values(hoursPerDay)) {
    if (hours > 4) fullTimeDays++;
    else partTimeDays++;
  }

  const companySummaries = groupByCompany(monthShifts);
  const dailyEarnings = getDailyEarnings(monthShifts, month, year);

  return {
    totalDays: uniqueDays,
    totalHours,
    totalEarnings,
    totalShifts,
    fullTimeDays,
    partTimeDays,
    companySummaries,
    dailyEarnings,
  };
}

export function groupByCompany(shifts: Shift[]): CompanySummary[] {
  const map: Record<string, { shifts: Shift[] }> = {};
  for (const s of shifts) {
    if (!map[s.company]) map[s.company] = { shifts: [] };
    map[s.company].shifts.push(s);
  }
  return Object.entries(map).map(([company, { shifts: cs }]) => {
    const totalShifts = cs.length;
    const totalHours = parseFloat(
      cs.reduce((acc, s) => acc + s.totalHours, 0).toFixed(2)
    );
    const totalEarnings = parseFloat(
      cs.reduce((acc, s) => acc + s.totalEarnings, 0).toFixed(2)
    );
    const avgHourlyPay = parseFloat(
      (cs.reduce((acc, s) => acc + s.hourlyPay, 0) / totalShifts).toFixed(2)
    );
    return {
      company,
      totalShifts,
      totalHours,
      avgHourlyPay,
      totalEarnings,
      color: getCompanyColor(company),
    };
  });
}

function getDailyEarnings(shifts: Shift[], month: number, year: number): DailyEarning[] {
  const daysInMonth = new Date(year, month, 0).getDate();
  const result: DailyEarning[] = [];
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayShifts = shifts.filter((s) => s.date === dateStr);
    if (dayShifts.length > 0) {
      result.push({
        date: `${String(day).padStart(2, '0')}.${String(month).padStart(2, '0')}`,
        earnings: parseFloat(
          dayShifts.reduce((acc, s) => acc + s.totalEarnings, 0).toFixed(2)
        ),
        hours: parseFloat(
          dayShifts.reduce((acc, s) => acc + s.totalHours, 0).toFixed(2)
        ),
      });
    }
  }
  return result;
}

// ---------------------------------------------------------------------------
// CSV Export
// ---------------------------------------------------------------------------

export function exportToCSV(shifts: Shift[], month: number, year: number): void {
  const monthShifts = getShiftsForMonth(shifts, month, year);
  const headers = [
    'Date',
    'Company',
    'Role',
    'Start Time',
    'End Time',
    'Total Hours',
    'Hourly Pay (€)',
    'Total Earnings (€)',
    'Notes',
  ];
  const rows = monthShifts.map((s) => [
    formatDate(s.date),
    s.company,
    s.role,
    s.startTime,
    s.endTime,
    s.totalHours.toFixed(2),
    s.hourlyPay.toFixed(2),
    s.totalEarnings.toFixed(2),
    s.notes ?? '',
  ]);
  const csv = [headers, ...rows]
    .map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const monthName = new Date(year, month - 1).toLocaleString('en-GB', { month: 'long' });
  link.setAttribute('href', url);
  link.setAttribute('download', `shifts-${monthName}-${year}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
