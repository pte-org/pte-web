import type { AiScoreStatus } from "@pte/api-client";

/** An AI and a manual score this far apart (on 0–100) deserve a second look. */
export const AI_MANUAL_GAP_THRESHOLD = 20;

export const AI_SCORE_TEXT = {
  LABEL: "AI ước lượng",
  DISCLAIMER: "Điểm do AI ước lượng, chỉ để tham khảo. Điểm công bố do host chọn nguồn điểm.",
  CRITERIA_TITLE: "Tiêu chí",
  FEEDBACK_TITLE: "Nhận xét",
  TRANSCRIPT_TITLE: "Bản ghi lời nói",
  DETAIL_TITLE: "Chi tiết kỹ thuật",
  FALLBACK_NOTICE: "AI chấm bằng phương án dự phòng nên độ tin cậy thấp. Hãy xem lại điểm này.",
  LOW_CONFIDENCE: "Độ tin cậy thấp",
  FAILURE_TITLE: "AI chấm lỗi",
  FAILURE_REASON: (code: string) => `Mã lý do: ${code}`,
  NO_SCORE: "Chưa có điểm AI",
} as const;

export const AI_SCORE_STATUS_LABELS: Record<AiScoreStatus, string> = {
  PENDING: "Chờ AI chấm",
  SCORING: "AI đang chấm",
  FAILED: "AI chấm lỗi",
  SCORED: "AI đã chấm",
};

export const AI_SCORE_STATUS_VARIANT: Record<
  AiScoreStatus,
  "neutral" | "info" | "danger" | "success"
> = {
  PENDING: "neutral",
  SCORING: "info",
  FAILED: "danger",
  SCORED: "success",
};

/** Table row highlight for answers whose AI and manual scores differ a lot. */
export const AI_GAP_ROW_CLASS = "bg-[var(--cream-tint)]";
