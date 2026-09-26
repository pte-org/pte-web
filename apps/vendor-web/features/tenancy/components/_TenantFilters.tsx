"use client";

import type { ReactElement } from "react";
import {
  ORGANIZATION_TYPE_FILTER_OPTIONS,
  PLAN_FILTER_OPTIONS,
  STATUS_FILTER_OPTIONS,
  TENANCY_TEXT,
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

export const TenantFilters = ({ filter, onChange }: TenantFiltersProps): ReactElement => (
  <div className="grid gap-3 rounded-lg bg-white p-4 shadow-card md:grid-cols-2 xl:grid-cols-4">
    <div className="flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 shadow-sm focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100 md:col-span-2 xl:col-span-1">
      <SearchIcon />
      <input
        type="search"
        aria-label={TENANCY_TEXT.SEARCH_PLACEHOLDER}
        placeholder={TENANCY_TEXT.SEARCH_PLACEHOLDER}
        value={filter.query}
        onChange={(event) => onChange({ ...filter, query: event.target.value })}
        className="w-full appearance-none bg-transparent py-2 text-sm outline-none"
      />
    </div>
    <FilterSelect
      ariaLabel={STATUS_FILTER_OPTIONS[0].label}
      value={filter.status}
      options={STATUS_FILTER_OPTIONS}
      onChange={(value) => onChange({ ...filter, status: value as TenantStatusFilter })}
    />
    <FilterSelect
      ariaLabel={PLAN_FILTER_OPTIONS[0].label}
      value={filter.plan}
      options={PLAN_FILTER_OPTIONS}
      onChange={(value) => onChange({ ...filter, plan: value as TenantPlan | "all" })}
    />
    <FilterSelect
      ariaLabel={ORGANIZATION_TYPE_FILTER_OPTIONS[0].label}
      value={filter.organizationType}
      options={ORGANIZATION_TYPE_FILTER_OPTIONS}
      onChange={(value) => onChange({ ...filter, organizationType: value })}
    />
  </div>
);
