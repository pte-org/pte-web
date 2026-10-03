"use client";

import { type ChangeEvent, type ReactElement } from "react";
import { Select } from "@pte/ui";
import {
  ADMIN_SUPPORT_TICKETS_TEXT as T,
  CATEGORY_LABELS,
  STATUS_LABELS,
} from "../constants";
import type { TicketCategory, TicketStatus } from "../types";

const STATUS_OPTIONS = [
  { value: "", label: T.FILTER_ALL_STATUS },
  ...(Object.entries(STATUS_LABELS) as [TicketStatus, string][]).map(([value, label]) => ({
    value,
    label,
  })),
];

const CATEGORY_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: T.FILTER_ALL_CATEGORY },
  ...(Object.entries(CATEGORY_LABELS) as [TicketCategory, string][]).map(([value, label]) => ({
    value,
    label,
  })),
];

interface AdminTicketFiltersProps {
  status: TicketStatus | "";
  category: TicketCategory | "";
  tenantId: string;
  onStatusChange: (value: TicketStatus | "") => void;
  onCategoryChange: (value: TicketCategory | "") => void;
  onTenantIdChange: (value: string) => void;
}

export const AdminTicketFilters = ({
  status,
  category,
  tenantId,
  onStatusChange,
  onCategoryChange,
  onTenantIdChange,
}: AdminTicketFiltersProps): ReactElement => (
  <div className="flex flex-wrap items-center gap-3">
    <Select
      id="ticket-status-filter"
      value={status}
      onChange={(e) => onStatusChange(e.target.value as TicketStatus | "")}
      options={STATUS_OPTIONS}
    />
    <Select
      id="ticket-category-filter"
      value={category}
      onChange={(e) => onCategoryChange(e.target.value as TicketCategory | "")}
      options={CATEGORY_OPTIONS}
    />
    <input
      id="ticket-tenant-filter"
      type="text"
      value={tenantId}
      onChange={(e: ChangeEvent<HTMLInputElement>) => onTenantIdChange(e.target.value)}
      placeholder={T.FILTER_TENANT_PLACEHOLDER}
      className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 placeholder:text-gray-400 focus:border-action focus:outline-none focus:ring-1 focus:ring-action"
    />
  </div>
);
