import { ANSWER_TABLE_HEADERS, ANSWERS_SECTION_TEXT } from "./answers";

export const ATTEMPT_REVIEWS_QUERY_KEY = ["attemptReviews"] as const;

export const ATTEMPTS_SECTION_TEXT = {
  EMPTY_TITLE: "No submissions yet",
  UNKNOWN_STUDENT: "Unknown student",
  VIEW: "View answers",
  BACK: "Back to submissions",
  ATTEMPT_VALUE: ANSWERS_SECTION_TEXT.ATTEMPT_VALUE,
  PROGRESS: (scored: number, total: number) => `${scored} / ${total} scored`,
  FAILED: (count: number) => `${count} failed`,
  IN_PROGRESS: (count: number) => `${count} in progress`,
  WAITING: (count: number) => `${count} waiting`,
  SELECTED_HEADING: (studentName: string, attemptNumber: number | null) =>
    `${studentName} · ${ANSWERS_SECTION_TEXT.ATTEMPT_VALUE(attemptNumber)}`,
} as const;

export const ATTEMPT_TABLE_HEADERS = {
  STUDENT: "Student",
  ATTEMPT: ANSWER_TABLE_HEADERS.ATTEMPT,
  PROGRESS: "Scoring",
  ACTIONS: ANSWER_TABLE_HEADERS.ACTIONS,
} as const;
