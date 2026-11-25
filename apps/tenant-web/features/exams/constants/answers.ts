// Host-side answer review: the answer list/detail, AI scoring triggers and rescoring.

export const ANSWERS_QUERY_KEY = ["answers"] as const;
export const ANSWER_QUERY_KEY = ["answer"] as const;

export const ANSWERS_SECTION_TEXT = {
  EMPTY_TITLE: "No answers submitted yet",
  STATUS_FILTER_LABEL: "Status",
  STATUS_FILTER_ALL: "All statuses",
  VIEW: "View",
  FINAL_SCORE_PROVISIONAL: "Provisional: AI score, no score source chosen yet",
  COVERAGE: "The student answered {answered}/{expected} questions, {blank} left blank",
} as const;

export const ANSWER_TABLE_HEADERS = {
  QUESTION_NUMBER: "No.",
  TASK_TYPE: "Task Type",
  STATUS: "Status",
  EXAMINER_SCORE: "Examiner score",
  FINAL_SCORE: "Score",
  SUBMITTED_AT: "Submitted",
  ACTIONS: "Actions",
} as const;

export const ANSWER_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  AI_SCORING: "AI Scoring",
  SCORING_FAILED: "Scoring Failed",
  SCORED: "Scored",
  UNSCORED: "Not scored",
};

export const ANSWER_STATUS_VARIANT: Record<string, "info" | "success" | "neutral" | "danger"> = {
  PENDING: "neutral",
  UNSCORED: "neutral",
  AI_SCORING: "info",
  SCORING_FAILED: "danger",
  SCORED: "success",
};

export const ANSWER_DETAIL_TEXT = {
  TITLE: "Submitted Answer",
  TASK_TYPE_LABEL: "Task type",
  STATUS_LABEL: "Status",
  SCORE_LABEL: "Score",
  NOT_SCORED: "Not scored yet",
  OPTIONS_TITLE: "Options",
  SELECTED_BADGE: "Selected",
  CORRECT_BADGE: "Correct",
  INCORRECT_BADGE: "Incorrect",
  LINKED_TO_PREVIOUS: "Follows previous",
  NOT_LINKED_TO_PREVIOUS: "Wrong neighbour",
  PAIRS_SUMMARY: "{correct}/{total} adjacent pairs correct",
  STUDENT_ORDER_TITLE: "Student's order",
  CORRECT_ORDER_TITLE: "Correct order",
  STUDENT_ANSWER: "Student's answer",
  CORRECT_ANSWER: "Correct answer",
  BLANK_LABEL: "Blank",
  LEFT_EMPTY: "Left empty",
  WORD_INDICES_TITLE: "Selected word positions",
  AUDIO_UNAVAILABLE: "Audio recording is not available right now.",
  UNRECOGNIZED_NOTICE:
    "This answer's format could not be decoded automatically. Showing the raw submitted value below.",
  CLOSE: "Close",
} as const;

