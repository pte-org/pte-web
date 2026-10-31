"use client";

import { useState, type ReactElement } from "react";
import { DEFAULT_PAGE_SIZE, type AnswerListItemResponse } from "@pte/api-client";
import {
  Badge,
  Button,
  DataTable,
  PaginationControls,
  Select,
  useLocale,
  type DataTableColumn,
} from "@pte/ui";
import {
  ANSWER_STATUS_LABELS,
  ANSWER_STATUS_VARIANT,
  ANSWER_TABLE_HEADERS,
  ANSWERS_SECTION_TEXT,
} from "../constants";
import { AI_SCORE_TEXT, AiScoreCell } from "@/features/aiScore";
import { useAnswers, useHostScoreReview } from "../api";
import { AnswerDetailModal } from "./AnswerDetailModal";
import { useTenantSearchText } from "@/features/search/useTenantSearchText";
import { useDebouncedSearch } from "@/features/search/useDebouncedSearch";

interface AnswersSectionProps {
  sessionPublicId: string;
  /** The answers of one attempt (student) of the session. */
  attemptPublicId: string;
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

export const AnswersSection = ({
  sessionPublicId,
  attemptPublicId,
}: AnswersSectionProps): ReactElement => {
  const { locale, t } = useLocale();
  const searchText = useTenantSearchText("answers");
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(DEFAULT_PAGE_SIZE);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const debouncedSearch = useDebouncedSearch(search);
  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);

  const statusLabel = (status: string): string => {
    const keyByStatus: Record<string, string> = {
      PENDING: "tenant.answers.pending",
      AI_SCORING: "tenant.answers.aiScoring",
      SCORING_FAILED: "tenant.answers.scoringFailed",
      SCORED: "tenant.answers.scored",
      UNSCORED: "tenant.answers.unscored",
    };
    return t(
      keyByStatus[status] ?? "tenant.answers.status",
      ANSWER_STATUS_LABELS[status] ?? status,
    );
  };
  const statusOptions = [
    { label: t("tenant.answers.allStatuses", T.STATUS_FILTER_ALL), value: "" },
    ...["PENDING", "AI_SCORING", "SCORING_FAILED", "SCORED"].map((status) => ({
      label: statusLabel(status),
      value: status,
    })),
  ];

  const review = useHostScoreReview(sessionPublicId);
  const reviewByAnswer = new Map((review.data?.answers ?? []).map((view) => [view.answerPublicId, view]));
  const examinerScoreByAnswer = new Map(
    (review.data?.answers ?? []).map((view) => [
      view.answerPublicId,
      view.examinerAvailable ? view.examinerScore : null,
    ]),
  );

  /** The score this answer counts for: its own for objective items, the chosen source for AI-scored ones. */
  const answerScore = (row: AnswerListItemResponse): { value: number | null; provisional: boolean } => {
    if (!row.aiScored) return { value: row.unscored ? null : row.rawScore, provisional: false };
    const view = reviewByAnswer.get(row.answerPublicId);
    if (view?.selectedScoreSource === "EXAMINER") {
      return { value: examinerScoreByAnswer.get(row.answerPublicId) ?? null, provisional: false };
    }
    if (view?.selectedScoreSource === "AI") return { value: row.rawScore, provisional: false };
    return { value: row.rawScore, provisional: row.rawScore !== null };
  };

  const { data, isLoading } = useAnswers(
    sessionPublicId,
    statusFilter,
    page,
    size,
    attemptPublicId,
    debouncedSearch,
  );

  const columns: DataTableColumn<AnswerListItemResponse>[] = [
    {
      key: "questionNumber",
      header: t("tenant.answers.questionNumber", ANSWER_TABLE_HEADERS.QUESTION_NUMBER),
      cell: (row) => formatScore(row.questionNumber),
    },
    {
      key: "taskType",
      header: t("tenant.answers.taskType", ANSWER_TABLE_HEADERS.TASK_TYPE),
      cell: (row) => <span className="font-medium text-[var(--ink-primary)]">{row.taskType}</span>,
    },
    {
      key: "status",
      header: t("tenant.answers.status", ANSWER_TABLE_HEADERS.STATUS),
      cell: (row) => {
        // Backend keeps an unscored task (Personal Introduction) PENDING; nothing is awaited for it.
        const status = row.unscored && row.status === "PENDING" ? "UNSCORED" : row.status;
        return <Badge variant={ANSWER_STATUS_VARIANT[status]}>{statusLabel(status)}</Badge>;
      },
    },
    {
      key: "rawScore",
      header: t("tenant.answers.aiScore", AI_SCORE_TEXT.LABEL),
      cell: (row) =>
        row.aiScored ? (
          <AiScoreCell score={formatScore(row.rawScore)} fallback={row.aiFallback} />
        ) : (
          formatScore(null)
        ),
    },
    {
      key: "examinerScore",
      header: t("tenant.answers.examinerScore", ANSWER_TABLE_HEADERS.EXAMINER_SCORE),
      cell: (row) => formatScore(examinerScoreByAnswer.get(row.answerPublicId) ?? null),
    },
    {
      key: "finalScore",
      header: t("tenant.answers.finalScore", ANSWER_TABLE_HEADERS.FINAL_SCORE),
      cell: (row) => {
        const { value, provisional } = answerScore(row);
        return provisional ? (
          <span
            className="italic text-[var(--ink-secondary)]"
            title={t("tenant.answers.finalScoreProvisional", T.FINAL_SCORE_PROVISIONAL)}
          >
            {formatScore(value)}
          </span>
        ) : (
          <span className="font-medium text-[var(--ink-primary)]">{formatScore(value)}</span>
        );
      },
    },
    {
      key: "createdAt",
      header: t("tenant.answers.submitted", ANSWER_TABLE_HEADERS.SUBMITTED_AT),
      cell: (row) => formatDateTime(row.createdAt, locale),
    },
  ];

  // Only shown when the student left items blank; the table below lists answered items only.
  const blankCount =
    data?.expectedCount != null && data.answeredCount != null
      ? data.expectedCount - data.answeredCount
      : 0;

  return (
    <div className="flex flex-col gap-3">
      {blankCount > 0 && data?.expectedCount != null && data.answeredCount != null && (
        <p className="text-sm text-[var(--ink-secondary)]">
          {t("tenant.answers.coverage", T.COVERAGE, {
            answered: data.answeredCount,
            expected: data.expectedCount,
            blank: blankCount,
          })}
        </p>
      )}
      <DataTable
        columns={columns}
        rows={data?.items ?? []}
        getRowKey={(row) => row.answerPublicId}
        isLoading={isLoading}
        emptyTitle={t("tenant.answers.empty", T.EMPTY_TITLE)}
        searchPlaceholder={searchText.placeholder}
        searchAriaLabel={searchText.ariaLabel}
        filters={
          <Select
            aria-label={t("tenant.answers.status", ANSWER_TABLE_HEADERS.STATUS)}
            value={statusFilter}
            options={statusOptions}
            onChange={(event) => {
              setStatusFilter(event.target.value);
              setPage(0);
            }}
          />
        }
        searchValue={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(0);
        }}
        rowActionsHeader={t("tenant.answers.actions", ANSWER_TABLE_HEADERS.ACTIONS)}
        clientSideFiltering={false}
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
          <Button
            type="button"
            variant="secondary"
            className="whitespace-nowrap"
            onClick={() => setSelectedAnswerId(row.answerPublicId)}
          >
            {t("tenant.answers.view", T.VIEW)}
          </Button>
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
