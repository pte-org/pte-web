"use client";

import { useState, type ReactElement } from "react";
import { DEFAULT_PAGE_SIZE, type AnswerListItemResponse } from "@pte/api-client";
import { Badge, DataTable, PaginationControls, type DataTableColumn } from "@pte/ui";
import {
  ANSWER_STATUS_LABELS,
  ANSWER_STATUS_VARIANT,
  ANSWER_TABLE_HEADERS,
  ANSWERS_SECTION_TEXT,
} from "../constants";
import { AI_SCORE_TEXT, AiScoreCell, aiGapRowClass } from "@/features/aiScore";
import { useAnswers } from "../api";
import { AnswerDetailModal } from "./AnswerDetailModal";

interface AnswersSectionProps {
  sessionPublicId: string;
  /** The answers of one attempt (student) of the session. */
  attemptPublicId: string;
}

const T = ANSWERS_SECTION_TEXT;

const STATUS_OPTIONS = [
  { label: T.STATUS_FILTER_ALL, value: "" },
  { label: ANSWER_STATUS_LABELS.PENDING, value: "PENDING" },
  { label: ANSWER_STATUS_LABELS.AI_SCORING, value: "AI_SCORING" },
  { label: ANSWER_STATUS_LABELS.SCORING_FAILED, value: "SCORING_FAILED" },
  { label: ANSWER_STATUS_LABELS.SCORED, value: "SCORED" },
];

function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function formatScore(score: number | null): string {
  return score === null ? "—" : String(score);
}

export const AnswersSection = ({
  sessionPublicId,
  attemptPublicId,
}: AnswersSectionProps): ReactElement => {
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(DEFAULT_PAGE_SIZE);
  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);

  const { data, isLoading } = useAnswers(sessionPublicId, "", page, size, attemptPublicId);

  const columns: DataTableColumn<AnswerListItemResponse>[] = [
    {
      key: "taskType",
      header: ANSWER_TABLE_HEADERS.TASK_TYPE,
      cell: (row) => <span className="font-medium text-[var(--ink-primary)]">{row.taskType}</span>,
    },
    {
      key: "status",
      header: ANSWER_TABLE_HEADERS.STATUS,
      filterOptions: STATUS_OPTIONS,
      filterAccessor: (row) => row.status,
      cell: (row) => (
        <Badge variant={ANSWER_STATUS_VARIANT[row.status]}>
          {ANSWER_STATUS_LABELS[row.status]}
        </Badge>
      ),
    },
    {
      key: "rawScore",
      header: AI_SCORE_TEXT.LABEL,
      cell: (row) =>
        row.aiScored ? (
          <AiScoreCell score={formatScore(row.rawScore)} fallback={row.aiFallback} />
        ) : (
          formatScore(null)
        ),
    },
    {
      key: "teacherScore",
      header: ANSWER_TABLE_HEADERS.TEACHER_SCORE,
      cell: (row) => formatScore(row.teacherScore),
    },
    {
      key: "createdAt",
      header: ANSWER_TABLE_HEADERS.SUBMITTED_AT,
      filterType: "date-range",
      filterAccessor: (row) => row.createdAt,
      filterPlaceholder: "Date range",
      cell: (row) => formatDateTime(row.createdAt),
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <DataTable
        columns={columns}
        rows={data?.items ?? []}
        getRowKey={(row) => row.answerPublicId}
        isLoading={isLoading}
        emptyTitle={T.EMPTY_TITLE}
        rowActionsHeader={ANSWER_TABLE_HEADERS.ACTIONS}
        rowClassName={(row) =>
          row.aiScored ? aiGapRowClass(row.rawScore, row.teacherScore) : undefined
        }
        clientSidePagination={false}
        pagination={
          data ? (
            <PaginationControls
              meta={data}
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
        rowActions={(row) => (
          <button
            type="button"
            onClick={() => setSelectedAnswerId(row.answerPublicId)}
            className="rounded-lg border border-[var(--shell-border)] px-3 py-1.5 text-sm font-medium text-[var(--ink-primary)] hover:bg-[var(--surface-subtle)]"
          >
            {T.VIEW}
          </button>
        )}
      />

      <AnswerDetailModal
        key={selectedAnswerId ?? "answer-detail-closed"}
        answerPublicId={selectedAnswerId}
        onClose={() => setSelectedAnswerId(null)}
      />
    </div>
  );
};
