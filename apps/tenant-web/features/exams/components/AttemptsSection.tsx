"use client";

import { useState, type ReactElement } from "react";
import type { AttemptReviewItemResponse } from "@pte/api-client";
import { Badge, Button, DataTable, useLocale, type DataTableColumn } from "@pte/ui";
import { useAttemptReviews } from "../api/attemptReviews";
import { ATTEMPT_TABLE_HEADERS, ATTEMPTS_SECTION_TEXT as T } from "../constants/attemptReviews";
import { AnswersSection } from "./AnswersSection";
import { AttemptScoreSummary } from "./AttemptScoreSummary";

function formatDateTime(value: string, locale: "vi" | "en"): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

interface AttemptsSectionProps {
  sessionPublicId: string;
}

/** Submissions of one exam: a row per student attempt; opening a row shows that attempt's answers. */
export const AttemptsSection = ({ sessionPublicId }: AttemptsSectionProps): ReactElement => {
  const { locale, t } = useLocale();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { data: attempts, isLoading } = useAttemptReviews(sessionPublicId);

  const studentName = (row: AttemptReviewItemResponse): string =>
    row.studentName ?? t("tenant.attempts.unknownStudent", T.UNKNOWN_STUDENT);

  const examinerProgress = (row: AttemptReviewItemResponse): ReactElement | string => {
    const saved = row.examinerSavedCount;
    const total = row.examinerEligibleCount;
    switch (row.examinerStatus) {
      case "COMPLETED":
        return (
          <Badge variant="success">
            {t("tenant.attempts.examinerFinalized", T.EXAMINER_FINALIZED)}
          </Badge>
        );
      case "IN_PROGRESS":
        return (
          <Badge variant="info">
            {t("tenant.attempts.examinerInProgress", T.EXAMINER_IN_PROGRESS(saved, total), {
              saved,
              total,
            })}
          </Badge>
        );
      case "PENDING":
        return (
          <Badge variant="neutral">
            {t("tenant.attempts.examinerNotStarted", T.EXAMINER_NOT_STARTED(saved, total), {
              saved,
              total,
            })}
          </Badge>
        );
      default:
        return T.NO_EXAMINER;
    }
  };

  const selected = attempts?.find((row) => row.attemptPublicId === selectedId);

  if (selected) {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-[var(--ink-primary)]">
            {studentName(selected)}
          </h3>
          <Button type="button" variant="secondary" onClick={() => setSelectedId(null)}>
            {t("tenant.attempts.back", T.BACK)}
          </Button>
        </div>
        <AttemptScoreSummary attemptPublicId={selected.attemptPublicId} />
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
      header: t("tenant.attempts.student", ATTEMPT_TABLE_HEADERS.STUDENT),
      cell: (row) => (
        <span className="font-medium text-[var(--ink-primary)]">{studentName(row)}</span>
      ),
    },
    {
      key: "submittedAt",
      header: t("tenant.answers.submitted", ATTEMPT_TABLE_HEADERS.SUBMITTED_AT),
      cell: (row) =>
        row.submittedAt ? formatDateTime(row.submittedAt, locale) : T.NOT_SUBMITTED,
    },
    {
      key: "examiner",
      header: t("tenant.attempts.examiner", ATTEMPT_TABLE_HEADERS.EXAMINER),
      cell: (row) => row.examinerName ?? T.NO_EXAMINER,
    },
    {
      key: "examinerProgress",
      header: t("tenant.attempts.examinerProgress", ATTEMPT_TABLE_HEADERS.EXAMINER_PROGRESS),
      cell: (row) => examinerProgress(row),
    },
    {
      key: "progress",
      header: t("tenant.attempts.scoring", ATTEMPT_TABLE_HEADERS.PROGRESS),
      cell: (row) =>
        row.answerCount === 0 ? (
          <span className="text-[var(--ink-secondary)]">
            {t("tenant.attempts.noAiAnswers", T.NO_AI_ANSWERS)}
          </span>
        ) : (
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
      emptyTitle={t("tenant.attempts.empty", T.EMPTY_TITLE)}
      rowActionsHeader={t("tenant.answers.actions", ATTEMPT_TABLE_HEADERS.ACTIONS)}
      rowActions={(row) => (
        <Button
          type="button"
          variant="secondary"
          className="whitespace-nowrap"
          onClick={() => setSelectedId(row.attemptPublicId)}
        >
          {t("tenant.attempts.viewAnswers", T.VIEW)}
        </Button>
      )}
    />
  );
};
