"use client";

import { useState, type ReactElement } from "react";
import { Button, DataTable, ErrorState, Select, type DataTableColumn } from "@pte/ui";
import { useProctorAuditLog, useProctorSecurityAudit, type ProctorSecurityAuditPage } from "../api";
import { AUDIT_ACTION_LABELS, PROCTOR_AUDIT_TEXT as T } from "../constants";
import type { ProctorAuditLogEntry, ProctorSecurityAuditEntry } from "../types";

interface AuditLogViewProps {
  sessionPublicId: string;
}

type TabKey = "violations" | "security";

function shortId(value: string): string {
  return value.slice(0, 8).toUpperCase();
}

function formatTimestamp(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "short", timeStyle: "medium" }).format(date);
}

export const AuditLogView = ({ sessionPublicId }: AuditLogViewProps): ReactElement => {
  const [activeTab, setActiveTab] = useState<TabKey>("violations");
  const audit = useProctorAuditLog(sessionPublicId);
  const security = useProctorSecurityAudit(sessionPublicId);

  const violations = audit.data?.items ?? [];
  const violationColumns: DataTableColumn<ProctorAuditLogEntry>[] = [
    {
      key: "createdAt",
      header: T.COL_TIME,
      filterType: "date-range",
      filterAccessor: (row) => row.createdAt,
      filterPlaceholder: T.FILTER_DATE_RANGE,
      cell: (row) => formatTimestamp(row.createdAt),
    },
    {
      key: "action",
      header: T.COL_TYPE,
      cell: (row) => AUDIT_ACTION_LABELS[row.action],
    },
    {
      key: "performedBy",
      header: T.COL_PROCTOR,
      cell: (row) =>
        row.performedBy.fullName ||
        (row.performedBy.publicId ? shortId(row.performedBy.publicId) : "—"),
    },
    {
      key: "note",
      header: T.COL_DESCRIPTION,
      cell: (row) => row.note || "—",
    },
  ];

  const securityItems: ProctorSecurityAuditEntry[] = (security.data?.pages ?? []).flatMap(
    (page: ProctorSecurityAuditPage) => page.items,
  );
  const securityColumns: DataTableColumn<ProctorSecurityAuditEntry>[] = [
    {
      key: "recordedAt",
      header: T.COL_TIME,
      filterType: "date-range",
      filterAccessor: (row) => row.recordedAt,
      filterPlaceholder: T.FILTER_DATE_RANGE,
      cell: (row) => formatTimestamp(row.recordedAt),
    },
    {
      key: "eventType",
      header: T.COL_TYPE,
      cell: (row) => row.eventType,
    },
    {
      key: "description",
      header: T.COL_DESCRIPTION,
      cell: (row) => row.description || "—",
    },
  ];

  const securityHasNext = security.data?.pages.at(-1)?.hasNext ?? false;
  const securityIsEmpty = securityItems.length === 0;

  const logFilter = (
    <Select
      aria-label={T.FILTER_LOG_TYPE}
      value={activeTab}
      options={[
        { value: "violations", label: T.TAB_VIOLATIONS },
        { value: "security", label: T.TAB_SECURITY },
      ]}
      onChange={(event) => {
        const value = event.target.value;
        if (value === "violations" || value === "security") setActiveTab(value);
      }}
    />
  );

  return (
    <div className="w-full space-y-6 p-4 sm:p-6 lg:p-8">
      {(activeTab === "violations" ? audit.isError : security.isError) && (
        <div className="flex flex-wrap gap-3">{logFilter}</div>
      )}
      {activeTab === "violations" ? (
        audit.isError ? (
          <ErrorState
            title={T.ERROR_TITLE}
            description={T.ERROR_DESC}
            action={
              <Button variant="secondary" size="sm" onClick={() => void audit.refetch()}>
                {T.RETRY}
              </Button>
            }
          />
        ) : (
          <DataTable<ProctorAuditLogEntry>
            filters={logFilter}
            showSearch={false}
            columns={violationColumns}
            rows={violations}
            getRowKey={(row) => row.publicId}
            isLoading={audit.isLoading}
            emptyTitle={T.EMPTY_VIOLATIONS_TITLE}
            emptyDescription={T.EMPTY_VIOLATIONS_DESCRIPTION}
          />
        )
      ) : security.isError ? (
        <ErrorState
          title={T.ERROR_TITLE}
          description={T.ERROR_DESC}
          action={
            <Button variant="secondary" size="sm" onClick={() => void security.refetch()}>
              {T.RETRY}
            </Button>
          }
        />
      ) : (
        <div className="flex flex-col gap-4">
          <DataTable<ProctorSecurityAuditEntry>
            filters={logFilter}
            showSearch={false}
            columns={securityColumns}
            rows={securityItems}
            getRowKey={(row) => row.publicId}
            isLoading={security.isLoading}
            emptyTitle={T.EMPTY_AUDIT_TITLE}
            emptyDescription={T.EMPTY_AUDIT_DESCRIPTION}
          />
          <div className="flex items-center justify-end">
            <Button
              variant="secondary"
              disabled={!securityHasNext || securityIsEmpty || security.isFetchingNextPage}
              onClick={() => {
                if (security.hasNextPage) void security.fetchNextPage();
              }}
            >
              {securityHasNext ? T.LOAD_MORE : T.END_OF_AUDIT}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
