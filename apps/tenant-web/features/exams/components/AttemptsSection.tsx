"use client";

import { useState, type ReactElement } from "react";
import type { AttemptReviewItemResponse } from "@pte/api-client";
import { Badge, Button, DataTable, type DataTableColumn } from "@pte/ui";
import { useAttemptReviews } from "../api/attemptReviews";
import { ATTEMPT_TABLE_HEADERS, ATTEMPTS_SECTION_TEXT as T } from "../constants/attemptReviews";
import { AnswersSection } from "./AnswersSection";

interface AttemptsSectionProps {
  sessionPublicId: string;
}

/** Submissions of one exam: a row per student attempt; opening a row shows that attempt's answers. */
export const AttemptsSection = ({ sessionPublicId }: AttemptsSectionProps): ReactElement => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { data: attempts, isLoading } = useAttemptReviews(sessionPublicId);

  const studentName = (row: AttemptReviewItemResponse): string =>
    row.studentName ?? T.UNKNOWN_STUDENT;

  const selected = attempts?.find((row) => row.attemptPublicId === selectedId);

  if (selected) {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-[var(--ink-primary)]">
            {T.SELECTED_HEADING(studentName(selected), selected.attemptNumber)}
          </h3>
          <Button type="button" variant="secondary" onClick={() => setSelectedId(null)}>
            {T.BACK}
          </Button>
        </div>
        <AnswersSection
          sessionPublicId={sessionPublicId}
          attemptPublicId={selected.attemptPublicId}
        />
      </div>
    );
  }

  const columns: DataTableColumn<AttemptReviewItemResponse>[] = [
    {
      key: "student",
      header: ATTEMPT_TABLE_HEADERS.STUDENT,
      cell: (row) => (
        <span className="font-medium text-[var(--ink-primary)]">{studentName(row)}</span>
      ),
    },
    {
      key: "attemptNumber",
      header: ATTEMPT_TABLE_HEADERS.ATTEMPT,
      cell: (row) => T.ATTEMPT_VALUE(row.attemptNumber),
    },
    {
      key: "progress",
      header: ATTEMPT_TABLE_HEADERS.PROGRESS,
      cell: (row) => (
        <span className="flex flex-wrap items-center gap-2">
          <span>{T.PROGRESS(row.scoredCount, row.answerCount)}</span>
          {row.failedCount > 0 && <Badge variant="danger">{T.FAILED(row.failedCount)}</Badge>}
          {row.aiScoringCount > 0 && (
            <Badge variant="info">{T.IN_PROGRESS(row.aiScoringCount)}</Badge>
          )}
          {row.pendingCount > 0 && <Badge variant="neutral">{T.WAITING(row.pendingCount)}</Badge>}
        </span>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={attempts ?? []}
      getRowKey={(row) => row.attemptPublicId}
      isLoading={isLoading}
      emptyTitle={T.EMPTY_TITLE}
      rowActionsHeader={ATTEMPT_TABLE_HEADERS.ACTIONS}
      rowActions={(row) => (
        <Button
          type="button"
          variant="secondary"
          onClick={() => setSelectedId(row.attemptPublicId)}
        >
          {T.VIEW}
        </Button>
      )}
    />
  );
};
