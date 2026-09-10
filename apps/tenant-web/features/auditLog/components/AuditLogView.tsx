"use client";

import { useState, type ReactElement } from "react";
import { Alert, DataTable, LoadingState, PageHeader, type DataTableColumn } from "@pte/ui";
import { errorMessage } from "@/features/examoperations/errorMessage";
import { useOrgLabels } from "@/features/orgLabels/useOrgLabels";
import { AUDIT_LOG_AGGREGATE_TYPES, AUDIT_LOG_TABLE_HEADERS, AUDIT_LOG_TEXT } from "../constants";
import { useAuditLogs, type AuditLogEntry } from "../api";

export const AuditLogView = (): ReactElement => {
  const labels = useOrgLabels();
  const [aggregateType, setAggregateType] = useState<string>("");
  const { data: entries, isLoading, isError, error } = useAuditLogs(aggregateType || undefined);

  const columns: DataTableColumn<AuditLogEntry>[] = [
    {
      key: "when",
      header: AUDIT_LOG_TABLE_HEADERS.WHEN,
      cell: (entry) => new Date(entry.log.createdAt).toLocaleString(),
    },
    {
      key: "actor",
      header: AUDIT_LOG_TABLE_HEADERS.ACTOR,
      cell: (entry) => entry.actorName ?? AUDIT_LOG_TEXT.unknownActor,
    },
    { key: "action", header: AUDIT_LOG_TABLE_HEADERS.ACTION, cell: (entry) => entry.log.action },
    { key: "summary", header: AUDIT_LOG_TABLE_HEADERS.SUMMARY, cell: (entry) => entry.log.summary },
  ];

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title={AUDIT_LOG_TEXT.title} subtitle={AUDIT_LOG_TEXT.subtitle} />

      <Alert tone="info">{AUDIT_LOG_TEXT.scopeNote(labels.program, labels.class)}</Alert>

      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-gray-700" htmlFor="audit-log-filter">
          {AUDIT_LOG_TEXT.filterLabel}
        </label>
        <select
          id="audit-log-filter"
          value={aggregateType}
          onChange={(event) => setAggregateType(event.target.value)}
          className="rounded-md border border-gray-300 px-2.5 py-1.5 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-blue-200"
        >
          <option value="">{AUDIT_LOG_TEXT.filterAll}</option>
          <option value={AUDIT_LOG_AGGREGATE_TYPES.PROGRAM}>{labels.program}</option>
          <option value={AUDIT_LOG_AGGREGATE_TYPES.CLASS}>{labels.class}</option>
        </select>
      </div>

      {isError && <Alert tone="error">{errorMessage(error, AUDIT_LOG_TEXT.loadFailed)}</Alert>}

      {isLoading ? (
        <LoadingState rows={4} />
      ) : (
        <DataTable
          columns={columns}
          rows={entries ?? []}
          getRowKey={(entry) => entry.log.publicId}
          emptyTitle={AUDIT_LOG_TEXT.emptyTitle}
          emptyDescription={AUDIT_LOG_TEXT.emptyText}
        />
      )}
    </div>
  );
};
