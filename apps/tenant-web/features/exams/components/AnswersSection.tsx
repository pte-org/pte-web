"use client";

import { useState, type ReactElement } from "react";
import { DEFAULT_PAGE_SIZE, type AnswerListItemResponse } from "@pte/api-client";
import {
  ActionMenu,
  Badge,
  DataTable,
  EyeIcon,
  PaginationControls,
  PencilIcon,
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
import { AI_SCORE_TEXT, AiScoreCell, aiGapRowClass } from "@/features/aiScore";
import { useAnswers } from "../api";
import { AnswerDetailModal } from "./AnswerDetailModal";
import { TeacherScoreModal } from "./TeacherScoreModal";
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
  const [scoringAnswer, setScoringAnswer] = useState<AnswerListItemResponse | null>(null);

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
  const statusOptions = [
    { label: t("tenant.answers.allStatuses", T.STATUS_FILTER_ALL), value: "" },
    ...["PENDING", "AI_SCORING", "SCORING_FAILED", "SCORED"].map((status) => ({
      label: statusLabel(status),
      value: status,
    })),
  ];

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
      key: "taskType",
      header: t("tenant.answers.taskType", ANSWER_TABLE_HEADERS.TASK_TYPE),
      cell: (row) => <span className="font-medium text-[var(--ink-primary)]">{row.taskType}</span>,
    },
    {
      key: "status",
      header: t("tenant.answers.status", ANSWER_TABLE_HEADERS.STATUS),
      cell: (row) => (
        <Badge variant={ANSWER_STATUS_VARIANT[row.status]}>{statusLabel(row.status)}</Badge>
      ),
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
      key: "teacherScore",
      header: t("tenant.answers.teacherScore", ANSWER_TABLE_HEADERS.TEACHER_SCORE),
      cell: (row) => formatScore(row.teacherScore),
    },
    {
      key: "createdAt",
      header: t("tenant.answers.submitted", ANSWER_TABLE_HEADERS.SUBMITTED_AT),
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
        rowClassName={(row) =>
          row.aiScored ? aiGapRowClass(row.rawScore, row.teacherScore) : undefined
        }
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
          <ActionMenu
            label={t("tenant.answers.actions", ANSWER_TABLE_HEADERS.ACTIONS)}
            items={[
              {
                label: t("tenant.answers.view", T.VIEW),
                icon: EyeIcon,
                onSelect: () => setSelectedAnswerId(row.answerPublicId),
              },
              {
                label: t("tenant.answers.enterTeacherScore", T.ENTER_TEACHER_SCORE),
                icon: PencilIcon,
                onSelect: () => setScoringAnswer(row),
              },
            ]}
          />
        )}
      />

      <AnswerDetailModal
        key={selectedAnswerId ?? "answer-detail-closed"}
        answerPublicId={selectedAnswerId}
        onClose={() => setSelectedAnswerId(null)}
      />
      <TeacherScoreModal
        key={scoringAnswer?.answerPublicId ?? "teacher-score-closed"}
        answerPublicId={scoringAnswer?.answerPublicId ?? null}
        currentScore={scoringAnswer?.teacherScore ?? null}
        onClose={() => setScoringAnswer(null)}
      />
    </div>
  );
};
