"use client";

import type { ReactElement } from "react";
import {
  DateRangePicker,
  Select,
  useLocale,
  type DateRangeValue,
  type SelectOption,
} from "@pte/ui";

interface AuditLogFiltersProps {
  aggregateType: string;
  dateRange: DateRangeValue;
  resourceLabel: string;
  resourceOptions: readonly SelectOption[];
  onAggregateTypeChange: (value: string) => void;
  onDateRangeChange: (value: DateRangeValue) => void;
}

export function AuditLogFilters({
  aggregateType,
  dateRange,
  resourceLabel,
  resourceOptions,
  onAggregateTypeChange,
  onDateRangeChange,
}: AuditLogFiltersProps): ReactElement {
  const { t } = useLocale();

  return (
    <>
      <div className="w-full sm:w-auto sm:min-w-[170px]">
        <DateRangePicker
          id="tenant-audit-date-filter"
          ariaLabel={t("common.filterDateRange", "Filter by a date range")}
          value={dateRange}
          onChange={onDateRangeChange}
          placeholder={t("common.dateRange", "Date range")}
          variant="table"
          className="h-8"
        />
      </div>
      <div className="w-full sm:w-auto sm:min-w-[170px]">
        <Select
          id="tenant-audit-resource-filter"
          aria-label={resourceLabel}
          options={resourceOptions}
          value={aggregateType}
          variant="table"
          onChange={(event) => onAggregateTypeChange(event.target.value)}
        />
      </div>
    </>
  );
}
