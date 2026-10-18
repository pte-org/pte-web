"use client";

import type { ReactElement } from "react";
import { Alert, BackButton } from "@pte/ui";
import { useExaminerWorkText } from "../hooks/useExaminerWorkText";

interface ExaminerAttemptHeaderProps {
  sessionPublicId: string;
  attemptPublicId: string;
  publicationState?: "UNPUBLISHED" | "PUBLISHED" | "DRAFT";
  submittedCount: number;
  eligibleCount: number;
  statusBadge?: React.ReactNode;
  actions?: React.ReactNode;
  onBack: () => void;
}

export const ExaminerAttemptHeader = ({
  sessionPublicId,
  attemptPublicId,
  publicationState,
  submittedCount,
  eligibleCount,
  statusBadge,
  actions,
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
            <h2 className="text-xl font-bold text-slate-900">
              {T.ATTEMPT_LABEL} #{attemptPublicId.slice(0, 8).toUpperCase()}
            </h2>
            {statusBadge}
          </div>
          <p className="text-xs text-slate-500">
            {T.SESSION_LABEL} #{sessionPublicId.slice(0, 8).toUpperCase()} ·{" "}
            {T.PROGRESS_LABEL}: {submittedCount}/{eligibleCount}
          </p>
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>

      {publicationState === "PUBLISHED" && (
        <Alert tone="warning" title={T.PUBLISHED_COHORT}>
          {T.PUBLISHED_WARNING}
        </Alert>
      )}
    </div>
  );
};
