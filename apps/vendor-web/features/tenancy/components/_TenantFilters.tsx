"use client";

import type { ReactElement } from "react";
import { STATUS_FILTER_OPTIONS, TENANCY_TEXT } from "../constants";
import type { TenantFilter, TenantStatusFilter } from "../types";

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

export const TenantFilters = ({
  filter,
  onChange,
}: TenantFiltersProps): ReactElement => (
  <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-md shadow-slate-200/70 md:flex-row">
    <div className="flex flex-1 items-center gap-2 rounded-md border border-gray-200 bg-slate-50 px-3">
      <SearchIcon />
      <input
        type="search"
        aria-label={TENANCY_TEXT.SEARCH_PLACEHOLDER}
        placeholder={TENANCY_TEXT.SEARCH_PLACEHOLDER}
        value={filter.query}
        onChange={(event) => onChange({ ...filter, query: event.target.value })}
        className="w-full bg-transparent py-2 text-sm outline-none"
      />
    </div>
    <select
      aria-label={STATUS_FILTER_OPTIONS[0].label}
      value={filter.status}
      onChange={(event) =>
        onChange({
          ...filter,
          status: event.target.value as TenantStatusFilter,
        })
      }
      className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-blue-500"
    >
      {STATUS_FILTER_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);
