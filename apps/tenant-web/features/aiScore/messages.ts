/** Text of the AI score detail shown to the Host and the assigned Examiner. */
export const AI_SCORE_EN = {
  label: "AI estimate",
  disclaimer: "The score is an AI estimate, for reference only. The published score depends on the score source the Host chooses.",
  criteriaTitle: "Criteria",
  feedbackTitle: "Feedback",
  transcriptTitle: "Speech transcript",
  failureTitle: "AI scoring failed",
  failureReason: "Reason code: {code}",
  noScore: "No AI score yet",
  statusPending: "Waiting for AI",
  statusScoring: "AI is scoring",
  statusFailed: "AI scoring failed",
  statusScored: "AI scored",
} as const;

export type AiScoreMessageKey = keyof typeof AI_SCORE_EN;
export type AiScoreMessages = Record<AiScoreMessageKey, string>;

export const AI_SCORE_VI: AiScoreMessages = {
  label: "AI ước lượng",
  disclaimer: "Điểm do AI ước lượng, chỉ để tham khảo. Điểm công bố do host chọn nguồn điểm.",
  criteriaTitle: "Tiêu chí",
  feedbackTitle: "Nhận xét",
  transcriptTitle: "Bản ghi lời nói",
  failureTitle: "AI chấm lỗi",
  failureReason: "Mã lý do: {code}",
  noScore: "Chưa có điểm AI",
  statusPending: "Chờ AI chấm",
  statusScoring: "AI đang chấm",
  statusFailed: "AI chấm lỗi",
  statusScored: "AI đã chấm",
};
