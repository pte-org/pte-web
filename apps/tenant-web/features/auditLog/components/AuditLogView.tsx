"use client";

import { useState, type ReactElement } from "react";
import { DEFAULT_PAGE_SIZE } from "@pte/api-client";
import {
  Alert,
  DataTable,
  PaginationControls,
  useLocale,
  type DataTableColumn,
} from "@pte/ui";
import { errorMessage } from "@/features/examoperations/errorMessage";
import { useOrgLabels } from "@/features/orgLabels/useOrgLabels";
import { useTenantSearchText } from "@/features/search/useTenantSearchText";
import { useDebouncedSearch } from "@/features/search/useDebouncedSearch";
import {
  AUDIT_LOG_ACTION_LABELS,
  AUDIT_LOG_AGGREGATE_TYPES,
  AUDIT_LOG_RESOURCE_TYPES,
  AUDIT_LOG_TABLE_HEADERS,
  AUDIT_LOG_TEXT,
  humanizeAuditCode,
} from "../constants";
import { useAuditLogs, type AuditLogEntry } from "../api";
import { AuditLogFilters } from "./AuditLogFilters";

function createResourceFilterOptions(text: {
  allActivity: string;
  program: string;
  class: string;
  supportTicket: string;
  examSession: string;
}) {
  return [
    { value: "", label: text.allActivity },
    ...AUDIT_LOG_RESOURCE_TYPES.map((option) => ({
      value: option.value,
      label:
        option.value === AUDIT_LOG_AGGREGATE_TYPES.PROGRAM
          ? text.program
          : option.value === AUDIT_LOG_AGGREGATE_TYPES.CLASS
            ? text.class
            : option.value === "SupportTicket"
              ? text.supportTicket
              : option.value === "ExamSession"
                ? text.examSession
                : option.label,
    })),
  ];
}

export const AuditLogView = (): ReactElement => {
  const labels = useOrgLabels();
  const { locale, t } = useLocale();
  const searchText = useTenantSearchText("auditLog");
  const text = {
    when: t("tenant.audit.when", AUDIT_LOG_TABLE_HEADERS.WHEN),
    resource: t("tenant.audit.resource", AUDIT_LOG_TABLE_HEADERS.AGGREGATE_TYPE),
    actor: t("tenant.audit.actor", AUDIT_LOG_TABLE_HEADERS.ACTOR),
    action: t("tenant.audit.action", AUDIT_LOG_TABLE_HEADERS.ACTION),
    summary: t("tenant.audit.summary", AUDIT_LOG_TABLE_HEADERS.SUMMARY),
    allActivity: t("tenant.audit.allActivity", AUDIT_LOG_TEXT.filterAll),
    empty: t("tenant.audit.empty", AUDIT_LOG_TEXT.emptyTitle),
    emptyDescription: t("tenant.audit.emptyDescription", AUDIT_LOG_TEXT.emptyText),
    loadFailed: t("tenant.audit.loadFailed", AUDIT_LOG_TEXT.loadFailed),
    unknownActor: t("tenant.audit.unknownActor", AUDIT_LOG_TEXT.unknownActor),
    program: t("tenant.audit.program", labels.program),
    class: t("tenant.audit.class", labels.class),
    supportTicket: t("tenant.audit.supportTicket", "Support ticket"),
    examSession: t("tenant.audit.examSession", "Exam session"),
  };
  const resourceLabel = (value: string): string =>
    ({
      [AUDIT_LOG_AGGREGATE_TYPES.PROGRAM]: text.program,
      [AUDIT_LOG_AGGREGATE_TYPES.CLASS]: text.class,
      SupportTicket: text.supportTicket,
      ExamSession: text.examSession,
    })[value] ?? humanizeAuditCode(value);
  const actionLabel = (value: string): string => {
    const localized = AUDIT_LOG_ACTION_LABELS[value];
    if (localized) return locale === "vi" ? localized.vi : localized.en;
    return humanizeAuditCode(value);
  };
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(DEFAULT_PAGE_SIZE);
  const [search, setSearch] = useState("");
  const [aggregateType, setAggregateType] = useState("");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const debouncedSearch = useDebouncedSearch(search);
  const { data, isLoading, isError, error } = useAuditLogs(
    aggregateType || undefined,
    page,
    size,
    debouncedSearch,
    dateRange.from || undefined,
    dateRange.to || undefined,
  );
  const entries = data?.data ?? [];
  const resourceFilterOptions = createResourceFilterOptions(text);

  const columns: DataTableColumn<AuditLogEntry>[] = [
    {
      key: "when",
      header: text.when,
      cell: (entry) =>
        new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-GB", {
          dateStyle: "short",
          timeStyle: "medium",
        }).format(new Date(entry.log.createdAt)),
    },
    { key: "action", header: text.action, cell: (entry) => actionLabel(entry.log.action) },
    {
      key: "aggregateType",
      header: text.resource,
      cell: (entry) => {
        const typeLabel = resourceLabel(entry.log.aggregateType);
        const resourceName = entry.log.resourceName?.trim() || typeLabel;
        return (
          <div className="min-w-36">
            <p className="font-medium">{resourceName}</p>
            {entry.log.resourceCode && (
              <p className="mt-1 text-xs text-[var(--table-muted-text)]">
                {typeLabel} · {entry.log.resourceCode}
              </p>
            )}
          </div>
        );
      },
    },
    { key: "actor", header: text.actor, cell: (entry) => entry.actorName ?? text.unknownActor },
    { key: "summary", header: text.summary, cell: (entry) => entry.log.summary },
  ];

  return (
    <div className="flex flex-col gap-5">
      {isError && <Alert tone="error">{errorMessage(error, text.loadFailed)}</Alert>}

      <DataTable
        columns={columns}
        rows={entries}
        getRowKey={(entry) => entry.log.publicId}
        isLoading={isLoading}
        emptyTitle={text.empty}
        emptyDescription={text.emptyDescription}
        searchPlaceholder={searchText.placeholder}
        searchAriaLabel={searchText.ariaLabel}
        searchValue={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(0);
        }}
        filters={
          <AuditLogFilters
            aggregateType={aggregateType}
            dateRange={dateRange}
            resourceLabel={text.resource}
            resourceOptions={resourceFilterOptions}
            onAggregateTypeChange={(value) => {
              setAggregateType(value);
              setPage(0);
            }}
            onDateRangeChange={(value) => {
              setDateRange(value);
              setPage(0);
            }}
          />
        }
        clientSideFiltering={false}
        clientSidePagination={false}
        pagination={
          data ? (
            <PaginationControls
              meta={data.meta}
              onPageChange={setPage}
              disabled={isLoading}
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
};
