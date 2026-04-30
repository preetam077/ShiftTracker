'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { useShifts } from '@/hooks/useShifts';
import { useFilters } from '@/hooks/useFilters';
import { getShiftsForMonth } from '@/lib/calculations';
import { Shift, SortField } from '@/lib/types';
import { FilterControls } from '@/components/filters/FilterControls';
import { ShiftList } from '@/components/shifts/ShiftList';

export default function ShiftsPage() {
  const { shifts, removeShift, getUniqueCompanies, getUniqueRoles } = useShifts();
  const { filters, setMonth, setYear, setCompany, setRole, setSort, resetFilters } = useFilters();

  const filtered = useMemo(() => {
    let result = getShiftsForMonth(shifts, filters.month, filters.year);
    if (filters.company) result = result.filter((s) => s.company === filters.company);
    if (filters.role) result = result.filter((s) => s.role === filters.role);

    // Sort
    result.sort((a, b) => {
      let cmp = 0;
      switch (filters.sortField) {
        case 'date': cmp = a.date.localeCompare(b.date); break;
        case 'company': cmp = a.company.localeCompare(b.company); break;
        case 'totalHours': cmp = a.totalHours - b.totalHours; break;
        case 'totalEarnings': cmp = a.totalEarnings - b.totalEarnings; break;
      }
      return filters.sortDirection === 'asc' ? cmp : -cmp;
    });
    return result;
  }, [shifts, filters]);

  return (
    <div className="space-y-4 pt-10 lg:pt-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between fade-up">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Shift History</h1>
          <p className="text-[var(--text-muted)] text-sm mt-0.5">All your recorded shifts</p>
        </div>
        <Link href="/shifts/new" className="btn-primary text-sm self-start sm:self-auto">
          <Plus size={15} />
          Add Shift
        </Link>
      </div>

      {/* Filters */}
      <FilterControls
        filters={filters}
        companies={getUniqueCompanies()}
        roles={getUniqueRoles()}
        onMonthChange={setMonth}
        onYearChange={setYear}
        onCompanyChange={setCompany}
        onRoleChange={setRole}
        onSort={(f: SortField) => setSort(f)}
        onReset={resetFilters}
        totalResults={filtered.length}
      />

      {/* List */}
      <ShiftList
        shifts={filtered}
        onDelete={removeShift}
        sortField={filters.sortField}
        sortDirection={filters.sortDirection}
        onSort={(f: SortField) => setSort(f)}
      />
    </div>
  );
}
