import type { ExaminerWorkspaceText } from "../hooks/useExaminerWorkspaceText";

/** Maps backend blocking-reason codes to localized text; unknown codes keep the "blocked" prefix. */
export function getWorkspaceBlockingText(
  text: ExaminerWorkspaceText,
  reason: string | null | undefined,
): string {
  switch (reason) {
    case null:
    case undefined:
    case "":
      return "";
    case "ALREADY_PUBLISHED":
      return text.alreadyPublished;
    case "WAITING_FOR_HOST_FREEZE":
      return text.waitingForHostFreeze;
    case "COHORT_NOT_MANUAL_EXAMINER":
      return text.cohortNotManual;
    case "EXCLUDED_FROM_COHORT":
      return text.excludedFromCohort;
    case "CARRIED_OVER_DRAFTS_UNCONFIRMED":
      return text.carriedOverDrafts;
    default:
      return `${text.blockedReasonPrefix}${reason}`;
  }
}
