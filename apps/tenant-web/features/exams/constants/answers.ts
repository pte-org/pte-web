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
  AUDIO_UNAVAILABLE: "Audio recording is not available right now.",
  UNRECOGNIZED_NOTICE:
    "This answer's format could not be decoded automatically. Showing the raw submitted value below.",
  CLOSE: "Close",
} as const;

export const RESCORE_TEXT = {
  DESCRIPTION: (count: number) =>
    `${count} câu AI chấm lỗi hoặc bị kẹt. Chấm lại sẽ đưa các câu này vào hàng đợi.`,
  BUTTON: (count: number) => `Chấm lại ${count} câu`,
  SUBMITTING: "Đang gửi…",
  QUEUED: "Đã đưa vào hàng đợi chấm lại. Kết quả sẽ cập nhật sau ít phút.",
} as const;

export const START_AI_SCORING_TEXT = {
  DESCRIPTION:
    "Bài nộp hiển thị ngay khi thí sinh nộp bài và ở trạng thái chờ chấm. Bấm “Chấm điểm AI” để chạy chấm bằng AI.",
  BUTTON: "Chấm điểm AI",
  SUBMITTING: "Đang gửi…",
  CONFIRM_TITLE: "Chấm điểm AI cho kỳ thi này?",
  CONFIRM_DESCRIPTION:
    "Hệ thống sẽ gọi dịch vụ AI bên ngoài (Azure Speech, Gemini) để chấm các bài nộp và có phát sinh chi phí. Bài đã chấm xong sẽ không bị chấm lại.",
  CONFIRM_LABEL: "Chấm điểm",
  CANCEL_LABEL: "Hủy",
  QUEUED: "Đã nhận bài và đưa vào hàng đợi chấm. Kết quả sẽ cập nhật sau ít phút.",
} as const;
