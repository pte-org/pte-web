"use client";

import { useState, type ReactElement } from "react";
import { DEFAULT_PAGE_SIZE } from "@pte/api-client";
import { Alert, DataTable, PaginationControls, useLocale, type DataTableColumn } from "@pte/ui";
import { errorMessage } from "@/features/examoperations/errorMessage";
import { useOrgLabels } from "@/features/orgLabels/useOrgLabels";
import { AUDIT_LOG_AGGREGATE_TYPES, AUDIT_LOG_TABLE_HEADERS, AUDIT_LOG_TEXT } from "../constants";
import { useAuditLogs, type AuditLogEntry } from "../api";

export const AuditLogView = (): ReactElement => {
  const labels = useOrgLabels();
  const { locale, t } = useLocale();
  const text = {
    scopeNote: t("tenant.audit.scopeNote", AUDIT_LOG_TEXT.scopeNote(labels.program, labels.class)),
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
    supportTicket: t("tenant.audit.supportTicket", "SupportTicket"),
    examSession: t("tenant.audit.examSession", "ExamSession"),
    ticketSubmitted: t("tenant.audit.ticketSubmitted", "TicketSubmitted"),
    examPublished: t("tenant.audit.examPublished", "ExamPublished"),
  };
  const resourceLabel = (value: string): string =>
    ({
      [AUDIT_LOG_AGGREGATE_TYPES.PROGRAM]: text.program,
      [AUDIT_LOG_AGGREGATE_TYPES.CLASS]: text.class,
      SupportTicket: text.supportTicket,
      ExamSession: text.examSession,
    })[value] ?? value;
  const actionLabel = (value: string): string =>
    ({ TicketSubmitted: text.ticketSubmitted, ExamPublished: text.examPublished })[value] ?? value;
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(DEFAULT_PAGE_SIZE);
  const { data, isLoading, isError, error } = useAuditLogs(undefined, page, size);
  const entries = data?.data ?? [];

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
    {
      key: "aggregateType",
      header: text.resource,
      filterOptions: [
        { value: "", label: text.allActivity },
        { value: AUDIT_LOG_AGGREGATE_TYPES.PROGRAM, label: text.program },
        { value: AUDIT_LOG_AGGREGATE_TYPES.CLASS, label: text.class },
      ],
      filterAccessor: (entry) => entry.log.aggregateType,
      cell: (entry) => resourceLabel(entry.log.aggregateType),
    },
    { key: "actor", header: text.actor, cell: (entry) => entry.actorName ?? text.unknownActor },
    { key: "action", header: text.action, cell: (entry) => actionLabel(entry.log.action) },
    {
      key: "summary",
      header: text.summary,
      cell: (entry) =>
        entry.log.summary
          .replace("Submitted ticket", "Đã gửi yêu cầu")
          .replace("Exam published", "Kỳ thi đã phát hành"),
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <Alert tone="info">{text.scopeNote}</Alert>

      {isError && <Alert tone="error">{errorMessage(error, text.loadFailed)}</Alert>}

      <DataTable
        columns={columns}
        rows={entries ?? []}
        getRowKey={(entry) => entry.log.publicId}
        isLoading={isLoading}
        emptyTitle={text.empty}
        emptyDescription={text.emptyDescription}
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
