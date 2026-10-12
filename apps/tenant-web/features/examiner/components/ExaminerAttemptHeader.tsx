"use client";

import type { ReactElement } from "react";
import { Alert, ChevronLeftIcon } from "@pte/ui";
import { EXAMINER_WORK_TEXT as T } from "../constants";

interface ExaminerAttemptHeaderProps {
  sessionPublicId: string;
  attemptPublicId: string;
  publicationState?: "UNPUBLISHED" | "PUBLISHED" | "DRAFT";
  submittedCount: number;
  eligibleCount: number;
  onBack: () => void;
}

export const ExaminerAttemptHeader = ({
  sessionPublicId,
  attemptPublicId,
  publicationState,
  submittedCount,
  eligibleCount,
  onBack,
}: ExaminerAttemptHeaderProps): ReactElement => {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            <ChevronLeftIcon className="h-4 w-4" />
            <span>{T.BACK_TO_QUEUE}</span>
          </button>
          <h2 className="mt-2 text-xl font-bold text-slate-900">
            {T.ATTEMPT_LABEL} #{attemptPublicId.slice(0, 8).toUpperCase()}
          </h2>
          <p className="text-xs text-slate-500">
            {T.SESSION_LABEL} #{sessionPublicId.slice(0, 8).toUpperCase()} ·{" "}
            {T.PROGRESS_LABEL}: {submittedCount}/{eligibleCount}
          </p>
        </div>
      </div>

      {publicationState === "PUBLISHED" && (
        <Alert tone="warning" title="Published Cohort">
          {T.PUBLISHED_WARNING}
        </Alert>
      )}
    </div>
  );
};
