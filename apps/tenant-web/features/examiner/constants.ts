import type {
  ExaminerGradingIssueType,
  ExaminerGradingOperation,
  ExaminerQueueStatus,
} from "@pte/api-client";

export const EXAMINER_QUEUE_QUERY_KEY = ["examinerWorkQueue"] as const;
export const EXAMINER_ATTEMPT_QUERY_KEY = ["examinerAttemptWork"] as const;

export const EXAMINER_WORK_TEXT = {
  TITLE: "Examiner marking queue",
  FILTER_LABEL: "Queue status",
  STATUS_ALL: "All assignments",
  STATUS_PENDING: "Not started",
  STATUS_IN_PROGRESS: "In progress",
  STATUS_COMPLETED: "Completed",
  LOADING_QUEUE: "Loading assigned work…",
  QUEUE_ERROR: "Your marking queue could not be loaded.",
  EMPTY_QUEUE: "No assigned attempts in this queue.",
  ATTEMPT_LABEL: "Assigned attempt",
  SESSION_LABEL: "Session",
  PROGRESS_LABEL: "Answers submitted",
  OPEN_ATTEMPT: "Open marking work",
  BACK_TO_QUEUE: "Back to queue",
  LOADING_DETAIL: "Loading attempt answers…",
  DETAIL_ERROR: "Attempt work could not be loaded.",
  NO_ANSWERS: "This assignment has no currently available eligible answers.",
  PROMPT: "Question prompt",
  STUDENT_RESPONSE: "Student response",
  SCORE_LABEL: "Your score (0–100)",
  SUBMIT_SCORE: "Submit score",
  SUBMITTING: "Saving…",
  SAVED: "Score submitted",
  READ_ONLY: "Submitted scores are read-only.",
  SCORE_INVALID: "Enter a whole number from 0 to 100.",
  SUBMIT_ERROR: "Score could not be submitted.",
  AUDIO_UNAVAILABLE: "Audio playback is unavailable.",
  AUDIO_FAILED: "Audio failed to load.",
  IMAGE_FAILED: "Image failed to load.",
  RETRY: "Retry",
  LOADING_MEDIA: "Loading media…",
  IMAGE_ALT: "Question image prompt",
  AI_REFERENCE_TITLE: "AI Scoring Reference",
  AI_STATUS_AVAILABLE: "AI reference available",
  AI_STATUS_PENDING: "AI scoring in progress",
  AI_STATUS_FAILED: "AI scoring failed",
  AI_STATUS_UNAVAILABLE: "No AI reference for this question",
  USE_AI_SCORE: "Use AI score",
  DECISION_CONFIRM_AI: "Confirmed AI Score",
  DECISION_MANUAL: "Manual Examiner Score",
  DECISION_LEGACY: "Legacy Imported Score",
  CONFIRM_TITLE: "Confirm Score Submission",
  CONFIRM_DESCRIPTION: "You are about to commit your score decision. Once submitted, examiner scores cannot be changed.",
  CONFIRM_ACTION: "Confirm and submit",
  CANCEL: "Cancel",
  DIFF_FROM_AI: "Diff vs AI",
  STALE_REFERENCE_WARNING: "The underlying review state or AI reference changed while you were reviewing. Please verify before submitting.",
  ACKNOWLEDGE_STALE: "Review updated reference",
  STALE_REJECTED_MESSAGE: "The submission was rejected because the criteria or AI reference changed. Please review the updated version and submit a new confirmation.",
  BLOCKED_FINALIZATION: "Scoring submission is currently blocked",
  TARGET_ANSWER: "Answer",
  DECISION_KIND_LABEL: "Decision mode",
  EXPECTED_VERSION: "Review version",
  REQUEST_ID: "Request key",
  NAV_TITLE: "Question List",
  PREV_QUESTION: "Previous",
  NEXT_QUESTION: "Next",
  STATUS_SAVED: "Saved",
  STATUS_DRAFT: "Draft",
  PUBLISHED_WARNING: "This cohort has already been published. Scoring is closed.",
  UNSAVED_CHANGES_TITLE: "Unsaved Changes",
  UNSAVED_CHANGES_WARNING: "You have unsaved changes in your score draft. Leaving will discard this work.",
  DISCARD_AND_LEAVE: "Discard and leave",
  MEDIA_ERROR_WARNING: "Required prompt or response media failed to load. Please retry loading before scoring.",
  REFRESH_MEDIA: "Refresh media URLs",
  UNKNOWN_OUTCOME_TITLE: "Submission Outcome Unresolved",
  UNKNOWN_OUTCOME_MESSAGE: "The score submission encountered an error and its outcome is unconfirmed. You can retry the identical request or reconcile with the server.",
  RETRY_IDENTICAL: "Retry identical submission",
  RECONCILE_SERVER: "Reconcile with server",
  CONFIRM_INVALIDATED_WARNING: "The underlying question, review version, or media state changed while this dialog was open. Please close this dialog and review the latest content.",
  START_WORK: "Start marking",
  STARTING_WORK: "Starting…",
  SAVE_DRAFT: "Save draft",
  SAVING_DRAFT: "Saving draft…",
  DRAFT_SAVED: "Draft saved",
  COMMENT_LABEL: "Examiner feedback / comment",
  COMMENT_PLACEHOLDER: "Optional note or rationale (max 2000 chars)",
  FINALIZE_WORK: "Finalize attempt",
  FINALIZING: "Finalizing…",
  CONFIRM_FINALIZE_TITLE: "Confirm attempt finalization",
  CONFIRM_FINALIZE_DESC: "You are about to commit scores for all eligible answers in this attempt. Once finalized, scores cannot be modified.",
  REPORT_ISSUE: "Report issue",
  REPORT_ISSUE_TITLE: "Report grading issue",
  ISSUE_TYPE_LABEL: "Issue type",
  ISSUE_DESC_LABEL: "Issue description",
  SUBMIT_ISSUE: "Submit issue",
  GUIDELINES: "Marking guidelines",
  GUIDELINES_TITLE: "Examiner scoring guidelines",
  HISTORY_AUDIT: "Grading History & Audit",
  ISSUES_BLOCKING: "Grading is blocked by an unresolved issue on this attempt.",
  SUBMISSION_BLOCKED: "Submission Blocked",
  PROPOSED_SCORE: "Proposed Score:",
  STALE_REFERENCE: "Stale Reference",
  MEDIA_UNAVAILABLE_TITLE: "Media Unavailable",
  SUBMISSION_BLOCKED_FALLBACK: "You cannot submit scores for this answer.",
  PUBLISHED_COHORT: "Published Cohort",
  SCORED_OVER_TOTAL: "Scored / Total",
  TABLE_HEADER_SCORES: "Scores",
  TABLE_HEADER_AVG_SCORE: "Avg Score",
  TABLE_HEADER_VERSION: "Version",
  TABLE_HEADER_ACTION: "Action",
  REGRADE_LABEL: "(regrade)",
  QUESTIONS_SUFFIX: "questions",
  WORD_COUNT_PREFIX: "Word count: ",
  SELECTED_PREFIX: "Selected: ",
  SELECTED_WORD_INDEXES_PREFIX: "Selected word indexes: ",
  NOT_STARTED_TITLE: "Not started",
  SCORE_LABEL_SHORT: "Score:",
  AI_REVISION_LABEL: "AI revision:",
  ISSUE_TYPE_AUDIO: "Audio unavailable or unplayable",
  ISSUE_TYPE_MEDIA: "Image or media unavailable",
  ISSUE_TYPE_DATA: "Corrupted or missing response data",
  ISSUE_TYPE_OTHER: "Other issue",
  ISSUE_DESC_PLACEHOLDER: "Describe the issue preventing grading in detail (max 2000 chars)...",
  SUBMITTING_ISSUE: "Submitting…",
  SEARCH_BTN: "Search",
  ACTIVE_ISSUE_TITLE: "Active Issue Blocking Finalization",
  SCORING_NOTICE_TITLE: "Scoring Status Notice",
  SCORE_PLACEHOLDER: "0–100",
} as const;

export const EXAMINER_ISSUE_OPTIONS: { value: ExaminerGradingIssueType; label: string }[] = [
  { value: "AUDIO_UNAVAILABLE", label: EXAMINER_WORK_TEXT.ISSUE_TYPE_AUDIO },
  { value: "MEDIA_UNAVAILABLE", label: EXAMINER_WORK_TEXT.ISSUE_TYPE_MEDIA },
  { value: "RESPONSE_DATA", label: EXAMINER_WORK_TEXT.ISSUE_TYPE_DATA },
  { value: "OTHER", label: EXAMINER_WORK_TEXT.ISSUE_TYPE_OTHER },
];

export const EXAMINER_QUEUE_STATUSES: { value: ExaminerQueueStatus; label: string }[] = [
  { value: "ALL", label: EXAMINER_WORK_TEXT.STATUS_ALL },
  { value: "PENDING", label: EXAMINER_WORK_TEXT.STATUS_PENDING },
  { value: "IN_PROGRESS", label: EXAMINER_WORK_TEXT.STATUS_IN_PROGRESS },
  { value: "COMPLETED", label: EXAMINER_WORK_TEXT.STATUS_COMPLETED },
];

export const VALID_EXAMINER_QUEUE_STATUSES: readonly ExaminerQueueStatus[] = [
  "ALL",
  "PENDING",
  "IN_PROGRESS",
  "COMPLETED",
] as const;

export function parseExaminerQueueStatus(val: string | null | undefined): ExaminerQueueStatus {
  if (val && VALID_EXAMINER_QUEUE_STATUSES.includes(val as ExaminerQueueStatus)) {
    return val as ExaminerQueueStatus;
  }
  return "ALL";
}

/** Queue URL for a filter state; always carries `status` because the page falls back to the overview without it. */
export function buildExaminerQueueHref(
  status: ExaminerQueueStatus,
  page: number,
  search: string,
  sort: string,
): string {
  const params = new URLSearchParams({ status });
  if (page > 0) params.set("page", String(page));
  if (search.trim()) params.set("search", search.trim());
  if (sort && sort !== "ASSIGNED_ASC") params.set("sort", sort);
  return `/examiner/work?${params.toString()}`;
}

export const EXAMINER_HISTORY_DIALOG_TEXT = {
  TITLE_PREFIX: "Grading History & Audit Trail",
  DESCRIPTION: "Immutable audit record of all scoring and workflow transitions for this assigned attempt.",
  LOADING: "Loading audit history…",
  ERROR_TITLE: "Could not load grading history.",
  RETRY: "Retry",
  EMPTY_TITLE: "No grading events recorded yet.",
  COL_TIMESTAMP: "Timestamp",
  COL_ACTION: "Action",
  COL_ACTOR: "Actor",
  COL_TARGET_VERSION: "Target / Version",
  COL_SCORE_VALUES: "Score Values",
  COL_RUBRIC: "Rubric",
  COL_REASON_NOTES: "Reason / Notes",
  ATTEMPT_LEVEL: "Attempt level",
  PREVIOUS: "Previous",
  NEXT: "Next",
  CLOSE: "Close",
  OP_STARTED: "Started",
  OP_DRAFT_SAVED: "Draft Saved",
  OP_SCORE_CHANGED: "Score Changed",
  OP_FINALIZED: "Finalized",
  OP_REOPENED: "Reopened",
  OP_REGRADED: "Regraded",
  OP_ISSUE_REPORTED: "Issue Reported",
  OP_ISSUE_RESOLVED: "Issue Resolved",
} as const;

export const EXAMINER_OPERATION_BADGES: Record<
  ExaminerGradingOperation,
  { label: string; variant: "neutral" | "info" | "warning" | "success" | "danger" }
> = {
  START: { label: EXAMINER_HISTORY_DIALOG_TEXT.OP_STARTED, variant: "info" },
  SAVE_DRAFT: { label: EXAMINER_HISTORY_DIALOG_TEXT.OP_DRAFT_SAVED, variant: "neutral" },
  SCORE_CHANGE: { label: EXAMINER_HISTORY_DIALOG_TEXT.OP_SCORE_CHANGED, variant: "warning" },
  FINALIZE: { label: EXAMINER_HISTORY_DIALOG_TEXT.OP_FINALIZED, variant: "success" },
  REOPEN: { label: EXAMINER_HISTORY_DIALOG_TEXT.OP_REOPENED, variant: "warning" },
  REGRADE: { label: EXAMINER_HISTORY_DIALOG_TEXT.OP_REGRADED, variant: "warning" },
  REPORT_ISSUE: { label: EXAMINER_HISTORY_DIALOG_TEXT.OP_ISSUE_REPORTED, variant: "danger" },
  RESOLVE_ISSUE: { label: EXAMINER_HISTORY_DIALOG_TEXT.OP_ISSUE_RESOLVED, variant: "success" },
};

export const EXAMINER_GUIDELINES_DIALOG_TEXT = {
  LOADING: "Loading scoring guidelines…",
  POLICY_TITLE: "Scoring Scale & Policy",
  SCALE_PREFIX: "Scale: ",
  TASK_CRITERIA_TITLE: "Task Criteria",
  TEMPLATE_PREFIX: "Template: ",
  STANDARD_RUBRIC_FALLBACK: "Standard scalar 0–100 rubric applies.",
  EMPTY_TITLE: "No specific guidelines configured for this session.",
  CLOSE: "Close",
} as const;
