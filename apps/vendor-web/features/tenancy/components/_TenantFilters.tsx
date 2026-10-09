"use client";

import type { ReactElement } from "react";
import { DashboardCard } from "@pte/ui";
import { useAdminCopy } from "@/features/i18n/adminCopy";
import {
  ORGANIZATION_TYPE_FILTER_OPTIONS as RAW_ORGANIZATION_TYPE_FILTER_OPTIONS,
  PLAN_FILTER_OPTIONS as RAW_PLAN_FILTER_OPTIONS,
  STATUS_FILTER_OPTIONS as RAW_STATUS_FILTER_OPTIONS,
  TENANCY_TEXT as RAW_TENANCY_TEXT,
} from "../constants";
import type { TenantFilter, TenantPlan, TenantStatusFilter } from "../types";
import { FilterSelect } from "./_FilterSelect";

interface TenantFiltersProps {
  filter: TenantFilter;
  onChange: (filter: TenantFilter) => void;
}

const SearchIcon = (): ReactElement => (
  <svg
    viewBox="0 0 24 24"
    className="h-4 w-4 text-gray-400"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    aria-hidden="true"
  >
    <circle cx="11" cy="11" r="7" />
    <path d="m21 21-4.3-4.3" strokeLinecap="round" />
  </svg>
);

export const TenantFilters = ({ filter, onChange }: TenantFiltersProps): ReactElement => {
  const T = useAdminCopy(RAW_TENANCY_TEXT);
  const organizationTypeOptions = useAdminCopy(RAW_ORGANIZATION_TYPE_FILTER_OPTIONS);
  const planOptions = useAdminCopy(RAW_PLAN_FILTER_OPTIONS);
  const statusOptions = useAdminCopy(RAW_STATUS_FILTER_OPTIONS);
  return (
    <DashboardCard className="grid gap-3 p-5 shadow-none transition-[border-color,box-shadow] duration-200 hover:border-slate-300 hover:shadow-card md:grid-cols-2 xl:grid-cols-[minmax(0,2fr)_repeat(3,minmax(0,1fr))]">
      <div className="flex min-h-10 items-center gap-2 rounded-md border border-gray-300 bg-white px-3 shadow-sm transition-[border-color,box-shadow] duration-150 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100 md:col-span-2 xl:col-span-1">
        <SearchIcon />
        <input
          type="search"
          aria-label={T.SEARCH_PLACEHOLDER}
          placeholder={T.SEARCH_PLACEHOLDER}
          value={filter.query}
          onChange={(event) => onChange({ ...filter, query: event.target.value })}
          className="w-full appearance-none bg-transparent py-2 text-sm outline-none placeholder:text-slate-400"
        />
      </div>
      <FilterSelect
        ariaLabel={statusOptions[0].label}
        value={filter.status}
        options={statusOptions}
        onChange={(value) => onChange({ ...filter, status: value as TenantStatusFilter })}
      />
      <FilterSelect
        ariaLabel={planOptions[0].label}
        value={filter.plan}
        options={planOptions}
        onChange={(value) => onChange({ ...filter, plan: value as TenantPlan | "all" })}
      />
      <FilterSelect
        ariaLabel={organizationTypeOptions[0].label}
        value={filter.organizationType}
        options={organizationTypeOptions}
        onChange={(value) => onChange({ ...filter, organizationType: value })}
      />
    </DashboardCard>
  );
};
