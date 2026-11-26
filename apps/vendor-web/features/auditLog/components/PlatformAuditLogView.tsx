"use client";

import { useState, type ReactElement } from "react";
import { DEFAULT_PAGE_SIZE, getUserFacingApiErrorMessage } from "@pte/api-client";
import {
  Alert,
  DataTable,
  DateRangePicker,
  PaginationControls,
  Select,
  useLocale,
  type DateRangeValue,
} from "@pte/ui";
import { useDebouncedSearch } from "@/features/i18n/useDebouncedSearch";
import {
  PLATFORM_AUDIT_LOG_COPY,
  PLATFORM_AUDIT_RESOURCE_TYPES as RAW_RESOURCE_TYPES,
} from "../constants";
import { usePlatformAuditLogs } from "../api";
import { usePlatformAuditColumns } from "../hooks/usePlatformAuditColumns";

export function PlatformAuditLogView(): ReactElement {
  const { locale, t } = useLocale();
  const T = PLATFORM_AUDIT_LOG_COPY[locale];
  const resourceTypes = RAW_RESOURCE_TYPES.map((item) => ({
    value: item.value,
    label: item.label[locale],
  }));
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(DEFAULT_PAGE_SIZE);
  const [search, setSearch] = useState("");
  const [aggregateType, setAggregateType] = useState("");
  const [dateRange, setDateRange] = useState<DateRangeValue>({ from: "", to: "" });
  const debouncedSearch = useDebouncedSearch(search);
  const auditLogs = usePlatformAuditLogs(
    aggregateType || undefined,
    page,
    size,
    debouncedSearch,
    dateRange.from || undefined,
    dateRange.to || undefined,
  );
  const columns = usePlatformAuditColumns();
  const resourceFilterOptions = [
    { value: "", label: T.ALL_ACTIVITY },
    ...resourceTypes.map((item) => ({ value: item.value, label: item.label })),
  ];

  return (
    <div className="flex flex-col gap-5">
      {auditLogs.error && (
        <Alert tone="error">{getUserFacingApiErrorMessage(auditLogs.error, T.LOAD_FAILED)}</Alert>
      )}
      <DataTable
        columns={columns}
        rows={auditLogs.data?.data ?? []}
        getRowKey={(entry) => entry.log.publicId}
        isLoading={auditLogs.isLoading}
        emptyTitle={T.EMPTY}
        emptyDescription={T.EMPTY_DESCRIPTION}
        searchPlaceholder={T.SEARCH_PLACEHOLDER}
        searchAriaLabel={T.SEARCH_ARIA_LABEL}
        searchValue={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(0);
        }}
        filters={
          <>
            <div className="w-full sm:w-auto sm:min-w-[170px]">
              <DateRangePicker
                id="platform-audit-date-filter"
                ariaLabel={t("common.filterDateRange", "Filter by a date range")}
                value={dateRange}
                onChange={(value) => {
                  setDateRange(value);
                  setPage(0);
                }}
                placeholder={t("common.dateRange", "Date range")}
                variant="table"
                className="h-8"
              />
            </div>
            <div className="w-full sm:w-auto sm:min-w-[170px]">
              <Select
                id="platform-audit-resource-filter"
                aria-label={T.RESOURCE}
                options={resourceFilterOptions}
                value={aggregateType}
                variant="table"
                onChange={(event) => {
                  setAggregateType(event.target.value);
                  setPage(0);
                }}
              />
            </div>
          </>
        }
        clientSideFiltering={false}
        clientSidePagination={false}
        pagination={
          auditLogs.data ? (
            <PaginationControls
              meta={auditLogs.data.meta}
              onPageChange={setPage}
              disabled={auditLogs.isFetching}
              showPageSizeInput
              onPageSizeChange={(nextSize) => {
                setSize(nextSize);
                setPage(0);
              }}
            />
          ) : undefined
        }
      />
    </div>
  );
}
