"use client";

import { DateRangePicker, Select, type DateRangeValue } from "@pte/ui";
import type { OrderStatus } from "@pte/api-client";
import type { ReactElement } from "react";
import { BILLING_STATUS_VALUES } from "../statusConstants";

interface OrdersFiltersProps {
  dateRange: DateRangeValue;
  status: OrderStatus | "";
  dateRangeLabel: string;
  statusFilterLabel: string;
  statusLabel: (status: string) => string;
  allStatusesLabel: string;
  onDateRangeChange: (value: DateRangeValue) => void;
  onStatusChange: (value: OrderStatus | "") => void;
}

export const OrdersFilters = ({
  dateRange,
  status,
  dateRangeLabel,
  statusFilterLabel,
  statusLabel,
  allStatusesLabel,
  onDateRangeChange,
  onStatusChange,
}: OrdersFiltersProps): ReactElement => {
  const statusFilterOptions = [
    { value: "", label: allStatusesLabel },
    ...BILLING_STATUS_VALUES.map((statusValue) => ({
      value: statusValue,
      label: statusLabel(statusValue),
    })),
  ];

  return (
    <>
      <DateRangePicker
        ariaLabel={dateRangeLabel}
        value={dateRange}
        onChange={onDateRangeChange}
        placeholder={dateRangeLabel}
        variant="table"
        className="h-8"
      />
      <Select
        aria-label={statusFilterLabel}
        options={statusFilterOptions}
        value={status}
        onChange={(event) => onStatusChange(event.target.value as OrderStatus | "")}
        size="md"
        variant="table"
        className="min-w-[150px]"
      />
    </>
  );
};
