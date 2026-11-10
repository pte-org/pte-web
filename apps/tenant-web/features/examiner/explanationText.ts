/** Copy of the AI-score explanation and the rubric criteria popup on the marking screen. */
export const EXAMINER_EXPLANATION_TEXT = {
  en: {
    title: "Why the AI gave this score", level: "Band", noAiScore: "The AI has no score for this trait.",
    azureHow: "Speaking traits are not scored from a prompt: Azure Speech compares the recording with the expected text and returns 0–100 scores, which the platform converts to Pearson bands.",
    accuracy: "Azure accuracy", fluencyInput: "Azure fluency (with prosody when available)", outOf100: "/100",
    contentCounts: "Words read correctly", errors: "Replaced · omitted · inserted",
    criteria: "Criteria", criteriaTitle: "Scoring criteria", criteriaSource: "Quoted in English from the Pearson Score Guide.",
    noCriteria: "This trait has no level descriptions.",
  },
  vi: {
    title: "Vì sao AI cho điểm này", level: "Mức", noAiScore: "AI chưa có điểm cho tiêu chí này.",
    azureHow: "Tiêu chí nói không chấm bằng prompt: Azure Speech so bản ghi âm với văn bản kỳ vọng, trả điểm 0–100, rồi hệ thống quy đổi sang mức Pearson.",
    accuracy: "Azure accuracy", fluencyInput: "Azure fluency (kèm prosody nếu có)", outOf100: "/100",
    contentCounts: "Số từ đọc đúng", errors: "Thay · bỏ sót · thêm",
    criteria: "Tiêu chí", criteriaTitle: "Tiêu chí chấm", criteriaSource: "Trích nguyên văn tiếng Anh từ Pearson Score Guide.",
    noCriteria: "Tiêu chí này không có mô tả mức.",
  },
};

export type ExaminerExplanationText = (typeof EXAMINER_EXPLANATION_TEXT)["en"];
