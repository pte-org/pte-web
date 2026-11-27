/** Text of the Host's AI scoring buttons in the exam detail: rescoring stuck answers and the first scoring run. */
export const SCORING_ACTION_EN = {
  rescoreDescription: "{count} answers failed AI scoring or got stuck. Rescoring puts them back in the queue.",
  rescoreButton: "Rescore {count} answers",
  rescoreSubmitting: "Sending…",
  rescoreQueued: "Queued for rescoring. Results will update in a few minutes.",

  startDescription:
    "Submissions appear as soon as a student submits and wait to be scored. Click “AI scoring” to run AI scoring.",
  startButton: "AI scoring",
  startSubmitting: "Sending…",
  startConfirmTitle: "Run AI scoring for this exam?",
  startConfirmDescription:
    "The system will call external AI services (Azure Speech, Gemini) to score the submissions, which costs money. Answers that are already scored are not scored again.",
  startConfirmLabel: "Score",
  startCancel: "Cancel",
  startQueued: "Submissions received and queued for scoring. Results will update in a few minutes.",
} as const;

export type ScoringActionMessageKey = keyof typeof SCORING_ACTION_EN;
export type ScoringActionMessages = Record<ScoringActionMessageKey, string>;

export const SCORING_ACTION_VI: ScoringActionMessages = {
  rescoreDescription: "{count} câu AI chấm lỗi hoặc bị kẹt. Chấm lại sẽ đưa các câu này vào hàng đợi.",
  rescoreButton: "Chấm lại {count} câu",
  rescoreSubmitting: "Đang gửi…",
  rescoreQueued: "Đã đưa vào hàng đợi chấm lại. Kết quả sẽ cập nhật sau ít phút.",

  startDescription:
    "Bài nộp hiển thị ngay khi thí sinh nộp bài và ở trạng thái chờ chấm. Bấm “Chấm điểm AI” để chạy chấm bằng AI.",
  startButton: "Chấm điểm AI",
  startSubmitting: "Đang gửi…",
  startConfirmTitle: "Chấm điểm AI cho kỳ thi này?",
  startConfirmDescription:
    "Hệ thống sẽ gọi dịch vụ AI bên ngoài (Azure Speech, Gemini) để chấm các bài nộp và có phát sinh chi phí. Bài đã chấm xong sẽ không bị chấm lại.",
  startConfirmLabel: "Chấm điểm",
  startCancel: "Hủy",
  startQueued: "Đã nhận bài và đưa vào hàng đợi chấm. Kết quả sẽ cập nhật sau ít phút.",
};
