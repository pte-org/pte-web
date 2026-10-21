"use client";

import type { ReactElement } from "react";
import { Alert, useLocale } from "@pte/ui";
import { useHostScoreReview } from "../api";
import { RescoreAiButton } from "./RescoreAiButton";

interface ScoringOverviewPanelProps {
  sessionPublicId: string;
}

/** Session-wide scoring progress: attempt/assignment counts, pending examiner work and AI rescoring. */
export const ScoringOverviewPanel = ({
  sessionPublicId,
}: ScoringOverviewPanelProps): ReactElement | null => {
  const { t } = useLocale();
  const review = useHostScoreReview(sessionPublicId);

  if (!review.data) return null;
  const { data } = review;

  return (
    <div className="flex flex-col gap-3">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          label={t("tenant.scoreReview.aiEligibleAttempts", "AI-eligible attempts")}
          value={data.aiEligibleAttemptCount}
        />
        <Metric
          label={t("tenant.scoreReview.assigned", "Assigned")}
          value={data.assignedAttemptCount}
        />
        <Metric
          label={t("tenant.scoreReview.unassigned", "Unassigned")}
          value={data.unassignedAttemptCount}
        />
        <Metric
          label={t("tenant.scoreReview.examinerAnswersPending", "Examiner answers pending")}
          value={data.pendingExaminerAnswerCount}
        />
      </div>

      {data.pendingExaminerAnswerCount > 0 && (
        <Alert
          tone="warning"
          title={t("tenant.scoreReview.pendingExaminerTitle", "Pending examiner work")}
        >
          {t(
            "tenant.scoreReview.pendingExaminerCount",
            "{count} answer(s) are still waiting for examiners before reports can be published.",
            { count: data.pendingExaminerAnswerCount },
          )}
        </Alert>
      )}
      {data.unavailableSelectedAnswerCount > 0 && (
        <Alert
          tone="warning"
          title={t("tenant.scoreReview.unavailableScoresTitle", "Unavailable scores")}
        >
          {t(
            "tenant.scoreReview.unavailableScoresCount",
            "{count} answer(s) have no usable score for the reports.",
            { count: data.unavailableSelectedAnswerCount },
          )}
        </Alert>
      )}

      <RescoreAiButton
        sessionPublicId={sessionPublicId}
        rescorableCount={data.rescorableAnswerCount}
        publicationLocked={data.publicationLocked}
      />
    </div>
  );
};

function Metric({ label, value }: { label: string; value: number }): ReactElement {
  return (
    <div className="rounded-md bg-[var(--surface-subtle)] p-3">
      <div className="text-xs text-[var(--ink-secondary)]">{label}</div>
      <div className="mt-1 text-lg font-semibold text-[var(--ink-primary)]">{value}</div>
    </div>
  );
}
