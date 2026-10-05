"use client";

import type { ReactElement } from "react";
import { Select } from "@pte/ui";
import {
  CATEGORY_OPTIONS,
  STATUS_LABELS,
  SUPPORT_TICKETS_TEXT as T,
} from "../constants";
import type { TicketCategory, TicketStatus } from "../types";

const STATUS_OPTIONS = [
  { value: "", label: T.FILTER_ALL_STATUS },
  ...Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label })),
];

interface TicketFiltersProps {
  status: TicketStatus | "";
  category: TicketCategory | "";
  onStatusChange: (value: TicketStatus | "") => void;
  onCategoryChange: (value: TicketCategory | "") => void;
}

export const TicketFilters = ({
  status,
  category,
  onStatusChange,
  onCategoryChange,
}: TicketFiltersProps): ReactElement => (
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
      options={[{ value: "", label: T.FILTER_ALL_CATEGORY }, ...CATEGORY_OPTIONS] as { value: string; label: string }[]}
    />
  </div>
);
