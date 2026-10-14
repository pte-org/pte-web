import { ANSWER_TABLE_HEADERS } from "./answers";

export const ATTEMPT_REVIEWS_QUERY_KEY = ["attemptReviews"] as const;

export const ATTEMPTS_SECTION_TEXT = {
  EMPTY_TITLE: "No submissions yet",
  UNKNOWN_STUDENT: "Unknown student",
  VIEW: "View answers",
  BACK: "Back to submissions",
  PROGRESS: (scored: number, total: number) => `${scored} / ${total} scored`,
  FAILED: (count: number) => `${count} failed`,
  IN_PROGRESS: (count: number) => `${count} in progress`,
  WAITING: (count: number) => `${count} waiting`,
  NOT_SUBMITTED: "—",
} as const;

export const ATTEMPT_TABLE_HEADERS = {
  STUDENT: "Student",
  SUBMITTED_AT: ANSWER_TABLE_HEADERS.SUBMITTED_AT,
  PROGRESS: "Scoring",
  ACTIONS: ANSWER_TABLE_HEADERS.ACTIONS,
} as const;
