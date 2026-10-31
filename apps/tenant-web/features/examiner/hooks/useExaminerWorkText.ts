"use client";

import { useMemo } from "react";
import type { ExaminerGradingIssueType, ExaminerGradingOperation } from "@pte/api-client";
import { useLocale } from "@pte/ui";
import {
  EXAMINER_GUIDELINES_DIALOG_TEXT,
  EXAMINER_HISTORY_DIALOG_TEXT,
  EXAMINER_WORK_TEXT,
  type ExaminerGuidelinesText,
  type ExaminerHistoryText,
  type ExaminerWorkText,
} from "../constants";
import {
  EXAMINER_GUIDELINES_TEXT_VI,
  EXAMINER_HISTORY_TEXT_VI,
  EXAMINER_WORK_TEXT_VI,
} from "../messages/workVi";

type BadgeVariant = "neutral" | "info" | "warning" | "success" | "danger";

export const useExaminerWorkText = (): ExaminerWorkText => {
  const { locale } = useLocale();
  return locale === "vi" ? EXAMINER_WORK_TEXT_VI : EXAMINER_WORK_TEXT;
};

export const useExaminerHistoryText = (): ExaminerHistoryText => {
  const { locale } = useLocale();
  return locale === "vi" ? EXAMINER_HISTORY_TEXT_VI : EXAMINER_HISTORY_DIALOG_TEXT;
};

export const useExaminerGuidelinesText = (): ExaminerGuidelinesText => {
  const { locale } = useLocale();
  return locale === "vi" ? EXAMINER_GUIDELINES_TEXT_VI : EXAMINER_GUIDELINES_DIALOG_TEXT;
};

export const useExaminerIssueOptions = (): { value: ExaminerGradingIssueType; label: string }[] => {
  const T = useExaminerWorkText();
  return useMemo(
    () => [
      { value: "AUDIO_UNAVAILABLE", label: T.ISSUE_TYPE_AUDIO },
      { value: "MEDIA_UNAVAILABLE", label: T.ISSUE_TYPE_MEDIA },
      { value: "RESPONSE_DATA", label: T.ISSUE_TYPE_DATA },
      { value: "OTHER", label: T.ISSUE_TYPE_OTHER },
    ],
    [T],
  );
};

export const useExaminerOperationBadges = (): Record<
  ExaminerGradingOperation,
  { label: string; variant: BadgeVariant }
> => {
  const H = useExaminerHistoryText();
  return useMemo(
    () => ({
      START: { label: H.OP_STARTED, variant: "info" },
      SAVE_DRAFT: { label: H.OP_DRAFT_SAVED, variant: "neutral" },
      SCORE_CHANGE: { label: H.OP_SCORE_CHANGED, variant: "warning" },
      FINALIZE: { label: H.OP_FINALIZED, variant: "success" },
      REOPEN: { label: H.OP_REOPENED, variant: "warning" },
      REGRADE: { label: H.OP_REGRADED, variant: "warning" },
      REPORT_ISSUE: { label: H.OP_ISSUE_REPORTED, variant: "danger" },
      RESOLVE_ISSUE: { label: H.OP_ISSUE_RESOLVED, variant: "success" },
    }),
    [H],
  );
};

/** Backend sends machine codes as blocking reasons; unknown codes fall through untouched. */
export const getExaminerBlockingText = (T: ExaminerWorkText, reason: string): string => {
  switch (reason) {
    case "ALREADY_PUBLISHED":
      return T.BLOCK_ALREADY_PUBLISHED;
    case "WAITING_FOR_HOST_FREEZE":
      return T.BLOCK_WAITING_FOR_HOST_FREEZE;
    case "COHORT_NOT_MANUAL_EXAMINER":
      return T.BLOCK_COHORT_NOT_MANUAL;
    case "EXCLUDED_FROM_COHORT":
      return T.BLOCK_EXCLUDED_FROM_COHORT;
    case "CARRIED_OVER_DRAFTS_UNCONFIRMED":
      return T.BLOCK_CARRIED_OVER_DRAFTS;
    default:
      return reason;
  }
};
