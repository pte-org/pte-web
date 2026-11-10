"use client";

import { DateRangePicker, Select, type DateRangeValue } from "@pte/ui";
import type { ExaminerQueueStatus } from "@pte/api-client";
import type { ExaminerWorkspaceText } from "../hooks/useExaminerWorkspaceText";
import type { ReactElement } from "react";

interface ExaminerQueueFiltersProps {
  status: ExaminerQueueStatus;
  sort: string;
  dateRange: DateRangeValue;
  statusOptions: readonly { value: ExaminerQueueStatus; label: string }[];
  sortOptions: readonly { value: string; label: string }[];
  text: ExaminerWorkspaceText;
  onStatusChange: (value: ExaminerQueueStatus) => void;
  onSortChange: (value: string) => void;
  onDateRangeChange: (value: DateRangeValue) => void;
}

export const ExaminerQueueFilters = ({
  status,
  sort,
  dateRange,
  statusOptions,
  sortOptions,
  text,
  onStatusChange,
  onSortChange,
  onDateRangeChange,
}: ExaminerQueueFiltersProps): ReactElement => (
  <>
    <Select
      aria-label={text.filterLabel}
      value={status}
      onChange={(event) => {
        const selected = statusOptions.find((option) => option.value === event.target.value);
        if (selected) onStatusChange(selected.value);
      }}
      options={statusOptions}
      variant="table"
    />
    <Select
      aria-label={text.sortLabel}
      value={sort}
      onChange={(event) => onSortChange(event.target.value)}
      options={sortOptions}
      variant="table"
    />
    <DateRangePicker
      ariaLabel={text.filterDateRange}
      value={dateRange}
      onChange={onDateRangeChange}
      placeholder={text.filterDateRange}
      fromLabel={text.filterDateFrom}
      toLabel={text.filterDateTo}
      variant="table"
    />
  </>
);
