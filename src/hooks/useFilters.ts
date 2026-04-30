'use client';

import { useState } from 'react';
import { FilterState, SortDirection, SortField } from '@/lib/types';

function currentMonth() {
  return new Date().getMonth() + 1;
}
function currentYear() {
  return new Date().getFullYear();
}

export function useFilters() {
  const [filters, setFilters] = useState<FilterState>({
    month: currentMonth(),
    year: currentYear(),
    company: '',
    role: '',
    sortField: 'date',
    sortDirection: 'desc',
  });

  const setMonth = (month: number) => setFilters((f) => ({ ...f, month }));
  const setYear = (year: number) => setFilters((f) => ({ ...f, year }));
  const setCompany = (company: string) => setFilters((f) => ({ ...f, company }));
  const setRole = (role: string) => setFilters((f) => ({ ...f, role }));
  const setSort = (field: SortField) =>
    setFilters((f) => ({
      ...f,
      sortField: field,
      sortDirection: f.sortField === field && f.sortDirection === 'desc' ? 'asc' : 'desc',
    }));
  const setSortDirection = (sortDirection: SortDirection) =>
    setFilters((f) => ({ ...f, sortDirection }));
  const resetFilters = () =>
    setFilters({
      month: currentMonth(),
      year: currentYear(),
      company: '',
      role: '',
      sortField: 'date',
      sortDirection: 'desc',
    });

  return { filters, setMonth, setYear, setCompany, setRole, setSort, setSortDirection, resetFilters };
}
