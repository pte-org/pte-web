"use client";

import type { ReactElement } from "react";
import {
  CAPACITY_FILTER_OPTIONS,
  ORGANIZATION_TYPE_FILTER_OPTIONS,
  PLAN_FILTER_OPTIONS,
  STATUS_FILTER_OPTIONS,
  TENANCY_TEXT,
} from "../constants";
import type { TenantCapacityFilter, TenantFilter, TenantPlan, TenantStatusFilter } from "../types";

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
  <div className="grid gap-3 rounded-lg bg-white p-4 shadow-card md:grid-cols-2 xl:grid-cols-5">
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
    <select
      aria-label={STATUS_FILTER_OPTIONS[0].label}
      value={filter.status}
      onChange={(event) =>
        onChange({ ...filter, status: event.target.value as TenantStatusFilter })
      }
      className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none shadow-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
    >
      {STATUS_FILTER_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
    <select
      aria-label={PLAN_FILTER_OPTIONS[0].label}
      value={filter.plan}
      onChange={(event) => onChange({ ...filter, plan: event.target.value as TenantPlan | "all" })}
      className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none shadow-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
    >
      {PLAN_FILTER_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
    <select
      aria-label={ORGANIZATION_TYPE_FILTER_OPTIONS[0].label}
      value={filter.organizationType}
      onChange={(event) => onChange({ ...filter, organizationType: event.target.value })}
      className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none shadow-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
    >
      {ORGANIZATION_TYPE_FILTER_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
    <select
      aria-label={CAPACITY_FILTER_OPTIONS[0].label}
      value={filter.capacity}
      onChange={(event) =>
        onChange({ ...filter, capacity: event.target.value as TenantCapacityFilter })
      }
      className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none shadow-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
    >
      {CAPACITY_FILTER_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);
