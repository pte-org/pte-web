"use client";

import type { ReactElement } from "react";
import { Alert, BackButton } from "@pte/ui";
import { ScoreExplanationLink } from "@/features/scoreexplanation/components";
import { useExaminerWorkText } from "../hooks/useExaminerWorkText";

interface ExaminerAttemptHeaderProps {
  title: string;
  publicationState?: "UNPUBLISHED" | "PUBLISHED" | "DRAFT";
  submittedCount: number;
  eligibleCount: number;
  statusBadge?: React.ReactNode;
  actions?: React.ReactNode;
  /** Opens the score explanation of this attempt; the backend checks the examiner's assignment. */
  scoreExplanation?: { sessionPublicId: string; attemptPublicId: string };
  onBack: () => void;
}

export const ExaminerAttemptHeader = ({
  title,
  publicationState,
  submittedCount,
  eligibleCount,
  statusBadge,
  actions,
  scoreExplanation,
  onBack,
}: ExaminerAttemptHeaderProps): ReactElement => {
  const T = useExaminerWorkText();
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <BackButton
            href="/examiner/work"
            onClick={(e) => {
              e.preventDefault();
              onBack();
            }}
            label={T.BACK_TO_QUEUE}
          />
          <div className="mt-2 flex items-center gap-3">
            <h2 className="text-xl font-bold text-slate-900">{title}</h2>
            {statusBadge}
          </div>
          <p className="text-xs text-slate-500">
            {T.PROGRESS_LABEL}: {submittedCount}/{eligibleCount}
          </p>
        </div>
        {(actions || scoreExplanation) && (
          <div className="flex flex-wrap items-center gap-2">
            {scoreExplanation && <ScoreExplanationLink role="EXAMINER" {...scoreExplanation} />}
            {actions}
          </div>
        )}
      </div>

      {publicationState === "PUBLISHED" && (
        <Alert tone="warning" title={T.PUBLISHED_COHORT}>
          {T.PUBLISHED_WARNING}
        </Alert>
      )}
    </div>
  );
};
