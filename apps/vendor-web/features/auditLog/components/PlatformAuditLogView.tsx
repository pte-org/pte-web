"use client";

import { useState, type ReactElement } from "react";
import { useSearchParams } from "next/navigation";
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
  ACTOR_ID_SEARCH_PARAM,
  PLATFORM_AUDIT_LOG_COPY,
  PLATFORM_AUDIT_RESOURCE_TYPES,
} from "../constants";
import { usePlatformAuditActors, usePlatformAuditLogs } from "../api";
import { AuditEntryDrawer } from "./AuditEntryDrawer";
import { platformAuditColumns } from "./_platformAuditColumns";

const FILTER_CLASS = "w-full sm:w-auto sm:min-w-[170px]";

export function PlatformAuditLogView(): ReactElement {
  const { locale, t } = useLocale();
  const T = PLATFORM_AUDIT_LOG_COPY[locale];
  const searchParams = useSearchParams();
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(DEFAULT_PAGE_SIZE);
  const [search, setSearch] = useState("");
  const [aggregateType, setAggregateType] = useState("");
  const [actorId, setActorId] = useState(() => searchParams.get(ACTOR_ID_SEARCH_PARAM) ?? "");
  const [dateRange, setDateRange] = useState<DateRangeValue>({ from: "", to: "" });
  const [openEntryId, setOpenEntryId] = useState<string | null>(null);
  const debouncedSearch = useDebouncedSearch(search);
  const actors = usePlatformAuditActors();
  const auditLogs = usePlatformAuditLogs(
    aggregateType || undefined,
    page,
    size,
    debouncedSearch,
    dateRange.from || undefined,
    dateRange.to || undefined,
    { actorId: actorId || undefined },
  );
  const columns = platformAuditColumns({ locale, onViewChanges: setOpenEntryId });
  const resourceFilterOptions = [
    { value: "", label: T.ALL_ACTIVITY },
    ...PLATFORM_AUDIT_RESOURCE_TYPES.map((item) => ({
      value: item.value,
      label: item.label[locale],
    })),
  ];
  const actorFilterOptions = [
    { value: "", label: T.ALL_ACTORS },
    ...(actors.data ?? []).map((actor) => ({ value: actor.publicId, label: actor.fullName })),
  ];
  const resetToFirstPage =
    <Value,>(apply: (value: Value) => void) =>
    (value: Value) => {
      apply(value);
      setPage(0);
    };

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
        onSearchChange={resetToFirstPage(setSearch)}
        filters={
          <>
            <div className={FILTER_CLASS}>
              <DateRangePicker
                id="platform-audit-date-filter"
                ariaLabel={t("common.filterDateRange", "Filter by a date range")}
                value={dateRange}
                onChange={resetToFirstPage(setDateRange)}
                placeholder={t("common.dateRange", "Date range")}
                variant="table"
                className="h-8"
              />
            </div>
            <div className={FILTER_CLASS}>
              <Select
                id="platform-audit-resource-filter"
                aria-label={T.RESOURCE}
                options={resourceFilterOptions}
                value={aggregateType}
                variant="table"
                onChange={(event) => resetToFirstPage(setAggregateType)(event.target.value)}
              />
            </div>
            <div className={FILTER_CLASS}>
              <Select
                id="platform-audit-actor-filter"
                aria-label={T.ACTOR}
                options={actorFilterOptions}
                value={actorId}
                variant="table"
                onChange={(event) => resetToFirstPage(setActorId)(event.target.value)}
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
              onPageSizeChange={resetToFirstPage(setSize)}
            />
          ) : undefined
        }
      />
      <AuditEntryDrawer publicId={openEntryId} onClose={() => setOpenEntryId(null)} />
    </div>
  );
}
