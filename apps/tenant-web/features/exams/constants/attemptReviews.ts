import { ANSWER_TABLE_HEADERS } from "./answers";

export const ATTEMPT_REVIEWS_QUERY_KEY = ["attemptReviews"] as const;
export const ATTEMPT_REPORT_QUERY_KEY = ["attemptReport"] as const;

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
  NO_EXAMINER: "—",
  EXAMINER_NOT_STARTED: (saved: number, total: number) => `Not started · ${saved}/${total}`,
  EXAMINER_IN_PROGRESS: (saved: number, total: number) => `Marking · ${saved}/${total} answers`,
  EXAMINER_FINALIZED: "Finalized",
} as const;

export const ATTEMPT_SCORE_TEXT = {
  TITLE: "Score summary",
  PROVISIONAL: "Provisional: counts the answers scored so far",
  UNSELECTED_AI_NOTE:
    "Answers with no chosen score source are counted by their AI score. Totals may change once you choose.",
  OVERALL_NOTE: "Overall is only calculated when the exam covers all 4 skills.",
  OVERALL: "Overall",
  INSUFFICIENT: "Insufficient data",
  ERROR: "Unable to load this student's score summary.",
  NO_SCORE: "—",
  SKILL_LABELS: {
    SPEAKING: "Speaking",
    WRITING: "Writing",
    READING: "Reading",
    LISTENING: "Listening",
  } as Record<string, string>,
} as const;

export const ATTEMPT_TABLE_HEADERS = {
  STUDENT: "Student",
  SUBMITTED_AT: ANSWER_TABLE_HEADERS.SUBMITTED_AT,
  EXAMINER: "Examiner",
  EXAMINER_PROGRESS: "Examiner progress",
  PROGRESS: "AI scoring",
  ACTIONS: ANSWER_TABLE_HEADERS.ACTIONS,
} as const;
