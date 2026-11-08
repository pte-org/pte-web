import type { Locale } from "@pte/ui";

/**
 * Plain names for the fields of an example AI reply, so the page reads like a form instead of JSON. A field that is
 * not listed keeps its technical name.
 */
const FIELD_LABELS: Record<Locale, Record<string, string>> = {
  vi: {
    topic: "Chủ đề",
    transcript: "Nội dung đoạn nghe",
    question: "Câu hỏi",
    options: "Các lựa chọn",
    correctIndexes: "Vị trí đáp án đúng (đếm từ 0)",
    keyPoints: "Ý chính",
    passage: "Đoạn văn",
    taskType: "Dạng bài",
    passageWithSlots: "Đoạn văn có chỗ trống",
    slots: "Chỗ trống",
    essayPrompt: "Đề bài viết",
    turns: "Lượt nói",
    answer: "Đáp án",
    chartType: "Loại biểu đồ",
    title: "Tiêu đề",
    xLabel: "Nhãn trục ngang",
    yLabel: "Nhãn trục dọc",
    unit: "Đơn vị",
    categories: "Các mục",
    series: "Dãy số liệu",
    blanks: "Chỗ trống",
    displayedText: "Văn bản hiển thị (có từ bị đổi)",
    changedIndexes: "Vị trí các từ bị đổi (đếm từ 0)",
    situation: "Tình huống",
    paragraphs: "Các đoạn",
  },
  en: {
    topic: "Topic",
    transcript: "Spoken text",
    question: "Question",
    options: "Options",
    correctIndexes: "Position of the correct answers (from 0)",
    keyPoints: "Key points",
    passage: "Passage",
    taskType: "Task type",
    passageWithSlots: "Passage with gaps",
    slots: "Gaps",
    essayPrompt: "Essay prompt",
    turns: "Speaker turns",
    answer: "Answer",
    chartType: "Chart type",
    title: "Title",
    xLabel: "Horizontal axis label",
    yLabel: "Vertical axis label",
    unit: "Unit",
    categories: "Categories",
    series: "Data series",
    blanks: "Gaps",
    displayedText: "Displayed text (with changed words)",
    changedIndexes: "Position of the changed words (from 0)",
    situation: "Situation",
    paragraphs: "Paragraphs",
  },
};

/** What each value the system fills into a prompt stands for. */
const PLACEHOLDER_LABELS: Record<Locale, Record<string, string>> = {
  vi: {
    "{cefr}": "Trình độ CEFR mục tiêu",
    "{topicHint}": "Gợi ý chủ đề (nếu người tạo nhập)",
    "{avoidTopics}": "Các chủ đề gần đây cần tránh lặp",
    "{lengthRules}": "Giới hạn độ dài của dạng bài",
  },
  en: {
    "{cefr}": "Target CEFR level",
    "{topicHint}": "Topic hint (when the creator gives one)",
    "{avoidTopics}": "Recent topics not to repeat",
    "{lengthRules}": "Length limits of the task type",
  },
};

export function fieldLabel(field: string, locale: Locale): string {
  return FIELD_LABELS[locale][field] ?? field;
}

export function placeholderLabel(token: string, locale: Locale): string | undefined {
  return PLACEHOLDER_LABELS[locale][token];
}
