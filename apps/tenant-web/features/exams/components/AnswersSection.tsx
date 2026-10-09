"use client";

import { useState, type ReactElement } from "react";
import { DEFAULT_PAGE_SIZE, type AnswerListItemResponse } from "@pte/api-client";
import { Badge, DataTable, PaginationControls, useLocale, type DataTableColumn } from "@pte/ui";
import {
  ANSWER_STATUS_LABELS,
  ANSWER_STATUS_VARIANT,
  ANSWER_TABLE_HEADERS,
  ANSWERS_SECTION_TEXT,
} from "../constants";
import { useAnswers } from "../api";
import { AnswerDetailModal } from "./AnswerDetailModal";

interface AnswersSectionProps {
  sessionPublicId: string;
}

const T = ANSWERS_SECTION_TEXT;

function formatDateTime(value: string, locale: "vi" | "en"): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatScore(score: number | null): string {
  return score === null ? "—" : String(score);
}

export const AnswersSection = ({ sessionPublicId }: AnswersSectionProps): ReactElement => {
  const { locale, t } = useLocale();
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(DEFAULT_PAGE_SIZE);
  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);

  const statusLabel = (status: string): string => {
    const keyByStatus: Record<string, string> = {
      PENDING: "tenant.answers.pending",
      AI_SCORING: "tenant.answers.aiScoring",
      SCORING_FAILED: "tenant.answers.scoringFailed",
      SCORED: "tenant.answers.scored",
    };
    return t(
      keyByStatus[status] ?? "tenant.answers.status",
      ANSWER_STATUS_LABELS[status] ?? status,
    );
  };
  const attemptLabel = (attemptNumber: number | null): string =>
    attemptNumber === null
      ? t("tenant.answers.unavailable", "Unavailable")
      : t("tenant.answers.attempt", `Attempt ${attemptNumber}`, { number: attemptNumber });
  const statusOptions = [
    { label: t("tenant.answers.allStatuses", T.STATUS_FILTER_ALL), value: "" },
    ...["PENDING", "AI_SCORING", "SCORING_FAILED", "SCORED"].map((status) => ({
      label: statusLabel(status),
      value: status,
    })),
  ];

  const { data, isLoading } = useAnswers(sessionPublicId, "", page, size);

  const columns: DataTableColumn<AnswerListItemResponse>[] = [
    {
      key: "attemptNumber",
      header: t("tenant.answers.attemptHeader", ANSWER_TABLE_HEADERS.ATTEMPT),
      cell: (row) => (
        <span className="font-medium text-[var(--ink-primary)]">
          {attemptLabel(row.attemptNumber)}
        </span>
      ),
    },
    {
      key: "taskType",
      header: t("tenant.answers.taskType", ANSWER_TABLE_HEADERS.TASK_TYPE),
      cell: (row) => <span className="font-medium text-[var(--ink-primary)]">{row.taskType}</span>,
    },
    {
      key: "status",
      header: t("tenant.answers.status", ANSWER_TABLE_HEADERS.STATUS),
      filterOptions: statusOptions,
      filterAccessor: (row) => row.status,
      cell: (row) => (
        <Badge variant={ANSWER_STATUS_VARIANT[row.status]}>{statusLabel(row.status)}</Badge>
      ),
    },
    {
      key: "rawScore",
      header: t("tenant.answers.aiScore", ANSWER_TABLE_HEADERS.AI_SCORE),
      cell: (row) => formatScore(row.rawScore),
    },
    {
      key: "teacherScore",
      header: t("tenant.answers.teacherScore", ANSWER_TABLE_HEADERS.TEACHER_SCORE),
      cell: (row) => formatScore(row.teacherScore),
    },
    {
      key: "createdAt",
      header: t("tenant.answers.submitted", ANSWER_TABLE_HEADERS.SUBMITTED_AT),
      filterType: "date-range",
      filterAccessor: (row) => row.createdAt,
      filterPlaceholder: t("tenant.examList.dateRange", "Date range"),
      cell: (row) => formatDateTime(row.createdAt, locale),
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <DataTable
        columns={columns}
        rows={data?.items ?? []}
        getRowKey={(row) => row.answerPublicId}
        isLoading={isLoading}
        emptyTitle={t("tenant.answers.empty", T.EMPTY_TITLE)}
        rowActionsHeader={t("tenant.answers.actions", ANSWER_TABLE_HEADERS.ACTIONS)}
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
            {t("tenant.answers.view", T.VIEW)}
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
