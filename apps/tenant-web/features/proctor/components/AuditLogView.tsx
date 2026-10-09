"use client";

import { useState, type ReactElement } from "react";
import { Button, DataTable, PageHeader, type DataTableColumn } from "@pte/ui";
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

const TABS: { key: TabKey; label: string }[] = [
  { key: "violations", label: T.TAB_VIOLATIONS },
  { key: "security", label: T.TAB_SECURITY },
];

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
      filterPlaceholder: "Date range",
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
      cell: (row) => row.performedBy.fullName || shortId(row.performedBy.publicId),
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
      filterPlaceholder: "Date range",
      cell: (row) => formatTimestamp(row.recordedAt),
    },
    {
      key: "eventType",
      header: T.COL_TYPE,
      cell: (row) => row.eventType,
    },
    {
      key: "hashPosition",
      header: T.COL_HASH,
      cell: (row) => String(row.hashPosition),
    },
    {
      key: "description",
      header: T.COL_DESCRIPTION,
      cell: (row) => row.description || "—",
    },
  ];

  const securityHasNext = security.data?.pages.at(-1)?.hasNext ?? false;
  const securityIsEmpty = securityItems.length === 0;

  return (
    <div className="flex flex-col gap-6 p-8">
      <PageHeader title={T.TITLE} subtitle={T.SUBTITLE} />

      <section className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
        <span>
          {T.COL_PROCTOR}: <code className="font-mono text-xs">#{shortId(sessionPublicId)}</code>
        </span>
      </section>

      <div
        role="tablist"
        aria-label="Audit log tabs"
        className="flex gap-1 border-b border-slate-200"
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(tab.key)}
              className={
                "border-b-2 px-4 py-2 text-sm font-medium transition-colors " +
                (isActive
                  ? "border-blue-600 text-blue-700"
                  : "border-transparent text-slate-600 hover:text-slate-900")
              }
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "violations" ? (
        <DataTable<ProctorAuditLogEntry>
          columns={violationColumns}
          rows={violations}
          getRowKey={(row) => row.publicId}
          isLoading={audit.isFetching}
          emptyTitle={T.EMPTY_VIOLATIONS_TITLE}
          emptyDescription={T.EMPTY_VIOLATIONS_DESCRIPTION}
        />
      ) : (
        <div className="flex flex-col gap-4">
          <DataTable<ProctorSecurityAuditEntry>
            columns={securityColumns}
            rows={securityItems}
            getRowKey={(row) => row.publicId}
            isLoading={security.isFetching}
            emptyTitle={T.EMPTY_AUDIT_TITLE}
            emptyDescription={T.EMPTY_AUDIT_DESCRIPTION}
          />
          <div className="flex items-center justify-end">
            <Button
              variant="secondary"
              disabled={!securityHasNext || securityIsEmpty}
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
