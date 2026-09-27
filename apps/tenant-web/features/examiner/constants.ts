import type { ExaminerQueueStatus } from "@pte/api-client";

export const EXAMINER_QUEUE_QUERY_KEY = ["examinerWorkQueue"] as const;
export const EXAMINER_ATTEMPT_QUERY_KEY = ["examinerAttemptWork"] as const;

export const EXAMINER_WORK_TEXT = {
  TITLE: "Examiner marking queue",
  SUBTITLE: "Review only the attempts assigned to you and submit one score per eligible answer.",
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
  IMAGE_ALT: "Question image prompt",
} as const;

export const EXAMINER_QUEUE_STATUSES: { value: ExaminerQueueStatus; label: string }[] = [
  { value: "ALL", label: EXAMINER_WORK_TEXT.STATUS_ALL },
  { value: "PENDING", label: EXAMINER_WORK_TEXT.STATUS_PENDING },
  { value: "IN_PROGRESS", label: EXAMINER_WORK_TEXT.STATUS_IN_PROGRESS },
  { value: "COMPLETED", label: EXAMINER_WORK_TEXT.STATUS_COMPLETED },
];
