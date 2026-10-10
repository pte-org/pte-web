"use client";

import { useState, type ReactElement } from "react";
import { DEFAULT_PAGE_SIZE } from "@pte/api-client";
import {
  Alert,
  DataTable,
  PaginationControls,
  type DataTableColumn,
} from "@pte/ui";
import { errorMessage } from "@/features/examoperations/errorMessage";
import { useOrgLabels } from "@/features/orgLabels/useOrgLabels";
import { AUDIT_LOG_AGGREGATE_TYPES, AUDIT_LOG_TABLE_HEADERS, AUDIT_LOG_TEXT } from "../constants";
import { useAuditLogs, type AuditLogEntry } from "../api";

export const AuditLogView = (): ReactElement => {
  const labels = useOrgLabels();
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(DEFAULT_PAGE_SIZE);
  const { data, isLoading, isError, error } = useAuditLogs(undefined, page, size);
  const entries = data?.data ?? [];

  const columns: DataTableColumn<AuditLogEntry>[] = [
    {
      key: "when",
      header: AUDIT_LOG_TABLE_HEADERS.WHEN,
      cell: (entry) => new Date(entry.log.createdAt).toLocaleString(),
    },
    {
      key: "aggregateType",
      header: AUDIT_LOG_TABLE_HEADERS.AGGREGATE_TYPE,
      filterOptions: [
        { value: "", label: AUDIT_LOG_TEXT.filterAll },
        { value: AUDIT_LOG_AGGREGATE_TYPES.PROGRAM, label: labels.program },
        { value: AUDIT_LOG_AGGREGATE_TYPES.CLASS, label: labels.class },
      ],
      filterAccessor: (entry) => entry.log.aggregateType,
      cell: (entry) => entry.log.aggregateType,
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
      <Alert tone="info">{AUDIT_LOG_TEXT.scopeNote(labels.program, labels.class)}</Alert>

      {isError && <Alert tone="error">{errorMessage(error, AUDIT_LOG_TEXT.loadFailed)}</Alert>}

      <DataTable
        columns={columns}
        rows={entries ?? []}
        getRowKey={(entry) => entry.log.publicId}
        isLoading={isLoading}
        emptyTitle={AUDIT_LOG_TEXT.emptyTitle}
        emptyDescription={AUDIT_LOG_TEXT.emptyText}
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
