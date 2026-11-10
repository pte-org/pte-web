"use client";

import { useState, type ReactElement } from "react";
import { Badge, Button, DataTable, ErrorState, Pagination, useLocale, type DataTableColumn } from "@pte/ui";
import type { ExaminerHistoryItemResponse } from "@pte/api-client";
import { useExaminerHistory } from "../api";
import { useExaminerHistoryText, useExaminerOperationBadges } from "../hooks/useExaminerWorkText";

interface ExaminerGradingHistoryTableProps { sessionPublicId: string; attemptPublicId: string }

export const ExaminerGradingHistoryTable = ({ sessionPublicId, attemptPublicId }: ExaminerGradingHistoryTableProps): ReactElement => {
  const text = useExaminerHistoryText();
  const badges = useExaminerOperationBadges();
  const { locale } = useLocale();
  const [page, setPage] = useState(0);
  const query = useExaminerHistory(sessionPublicId, attemptPublicId, page);
  const totalPages = query.data?.totalPages ?? 1;
  const columns: DataTableColumn<ExaminerHistoryItemResponse>[] = [
    { key: "time", header: text.COL_TIMESTAMP, sortable: false, cellClassName: "whitespace-nowrap", cell: (row) => {
      const date = new Date(row.occurredAt);
      return Number.isNaN(date.getTime()) ? row.occurredAt : date.toLocaleString(locale === "vi" ? "vi-VN" : "en-GB");
    } },
    { key: "operation", header: text.COL_ACTION, sortable: false, cell: (row) => <Badge variant={badges[row.operation]?.variant ?? "neutral"}>{badges[row.operation]?.label ?? row.operation}</Badge> },
    { key: "actor", header: text.COL_ACTOR, sortable: false, cell: (row) => row.actorRole ?? "EXAMINER" },
    { key: "target", header: text.COL_TARGET_VERSION, sortable: false, cell: (row) => <div>
      <p>{row.answerPublicId ? `${text.ANSWER_PREFIX}${row.answerPublicId.slice(0, 8)}` : text.ATTEMPT_LEVEL}</p>
      <p className="text-xs text-[var(--ink-muted)]">w:v{row.workVersion}{row.draftVersion != null ? `, d:v${row.draftVersion}` : ""}</p>
    </div> },
    { key: "score", header: text.COL_SCORE_VALUES, sortable: false, cell: (row) => row.previousScore != null && row.newScore != null ? `${row.previousScore} → ${row.newScore}` : row.newScore != null ? `${row.newScore} / 100` : "—" },
    { key: "rubric", header: text.COL_RUBRIC, sortable: false, cell: (row) => row.rubricVersion != null ? `v${row.rubricVersion}` : "—" },
    { key: "notes", header: text.COL_REASON_NOTES, sortable: false, cell: (row) => <p className="min-w-40 whitespace-normal break-words">{row.reason || "—"}</p> },
  ];
  if (query.isError) return <ErrorState title={text.ERROR_TITLE} action={<Button variant="secondary" size="sm" onClick={() => void query.refetch()}>{text.RETRY}</Button>} />;
  return <section className="min-w-0 space-y-4">
    <p className="text-sm text-[var(--ink-secondary)]">{text.DESCRIPTION}</p>
    <DataTable columns={columns} rows={query.data?.items ?? []} getRowKey={(row) => row.eventPublicId}
      isLoading={query.isLoading} emptyTitle={text.EMPTY_TITLE} showSearch={false}
      clientSideFiltering={false} clientSideSorting={false} clientSidePagination={false}
      pagination={totalPages > 1 ? <Pagination currentPage={page + 1} totalPages={totalPages} onPageChange={(value) => setPage(value - 1)} /> : undefined} />
  </section>;
};
