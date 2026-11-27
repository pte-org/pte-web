/**
 * Scoring rule of each question type, summarised in our own words from the Pearson PTE Academic
 * Test Taker Score Guide (2026 edition, pages 15–44). Keys follow STANDARD_TASK_WEIGHTS.
 */
export type ScoringKind = "correct" | "partial" | "trait";

export interface Trait {
  name: string;
  max: string;
}

export interface OfficialRule {
  kind: ScoringKind;
  page: number;
  traits: readonly Trait[];
  gate: boolean;
  en: string;
  vi: string;
}

const SPEECH: readonly Trait[] = [
  { name: "Pronunciation", max: "5" },
  { name: "Oral Fluency", max: "5" },
];

const TRAIT_SPEAKING = (page: number, en: string, vi: string): OfficialRule => ({
  kind: "trait",
  page,
  traits: [{ name: "Content", max: "6" }, ...SPEECH],
  gate: true,
  en,
  vi,
});

const OBJECTIVE = (kind: ScoringKind, page: number, en: string, vi: string): OfficialRule => ({
  kind,
  page,
  traits: [],
  gate: false,
  en,
  vi,
});

export const OFFICIAL_RULES: Record<string, OfficialRule> = {
  READ_ALOUD: {
    kind: "trait",
    page: 15,
    traits: [{ name: "Content", max: "N" }, ...SPEECH],
    gate: false,
    en: "Content: every word replaced, left out or added counts as one error; the maximum equals the passage length (N words).",
    vi: "Content: mỗi từ đọc thay, bỏ sót hoặc chèn thêm tính 1 lỗi; điểm tối đa bằng số từ của đoạn văn (N).",
  },
  REPEAT_SENTENCE: {
    kind: "trait",
    page: 16,
    traits: [{ name: "Content", max: "3" }, ...SPEECH],
    gate: false,
    en: "Content 3 = every word in order; 2 = at least half; 1 = less than half; 0 = almost nothing.",
    vi: "Content 3 = đủ mọi từ đúng thứ tự; 2 = ít nhất một nửa; 1 = dưới một nửa; 0 = gần như không có gì.",
  },
  DESCRIBE_IMAGE: TRAIT_SPEAKING(18, "Content judges how well the key features of the image are described.", "Content đánh giá mức độ mô tả đúng các điểm chính của hình."),
  RE_TELL_LECTURE: TRAIT_SPEAKING(21, "Content judges how well the main ideas of the lecture are retold in your own words.", "Content đánh giá mức độ kể lại đúng ý chính của bài giảng bằng lời của mình."),
  ANSWER_SHORT_QUESTION: {
    kind: "correct",
    page: 24,
    traits: [{ name: "Vocabulary", max: "1" }],
    gate: false,
    en: "One point for an appropriate answer word, otherwise zero.",
    vi: "Trả lời đúng từ cần thiết được 1 điểm, sai được 0.",
  },
  SUMMARIZE_GROUP_DISCUSSION: TRAIT_SPEAKING(25, "Content judges how well each speaker's main points are summarised.", "Content đánh giá mức độ tóm tắt đúng ý chính của từng người nói."),
  RESPOND_TO_A_SITUATION: TRAIT_SPEAKING(29, "Content judges how appropriately the response deals with the situation.", "Content đánh giá câu trả lời có xử lý đúng tình huống hay không."),
  SUMMARIZE_WRITTEN_TEXT: {
    kind: "trait",
    page: 32,
    traits: [
      { name: "Content", max: "4" },
      { name: "Form", max: "1" },
      { name: "Grammar", max: "2" },
      { name: "Vocabulary", max: "2" },
    ],
    gate: true,
    en: "Form 1 = one single complete sentence of at most 75 words.",
    vi: "Form 1 = đúng một câu hoàn chỉnh, không quá 75 từ.",
  },
  WRITE_ESSAY: {
    kind: "trait",
    page: 34,
    traits: [
      { name: "Content", max: "6" },
      { name: "Form", max: "2" },
      { name: "Development, Structure & Coherence", max: "6" },
      { name: "Grammar", max: "2" },
      { name: "General Linguistic Range", max: "6" },
      { name: "Vocabulary Range", max: "2" },
      { name: "Spelling", max: "2" },
    ],
    gate: true,
    en: "Form 2 = 200–300 words; 1 = 120–199 or 301–380; 0 = anything else.",
    vi: "Form 2 = 200–300 từ; 1 = 120–199 hoặc 301–380 từ; 0 = ngoài khoảng đó.",
  },
  FILL_IN_THE_BLANKS_DROPDOWN: OBJECTIVE("partial", 40, "1 point per correctly completed blank.", "Mỗi chỗ trống điền đúng được 1 điểm."),
  MC_READING_MULTIPLE: OBJECTIVE("partial", 40, "+1 per correct option, −1 per wrong option, never below 0.", "Chọn đúng +1, chọn sai −1, thấp nhất là 0."),
  RE_ORDER_PARAGRAPHS: OBJECTIVE("partial", 40, "1 point per pair of neighbouring boxes in the correct order.", "Mỗi cặp đoạn đứng cạnh nhau đúng thứ tự được 1 điểm."),
  FILL_IN_THE_BLANKS_DRAG_AND_DROP: OBJECTIVE("partial", 40, "1 point per correctly completed blank.", "Mỗi chỗ trống điền đúng được 1 điểm."),
  MC_READING_SINGLE: OBJECTIVE("correct", 40, "1 point if correct, 0 if not.", "Đúng 1 điểm, sai 0."),
  SUMMARIZE_SPOKEN_TEXT: {
    kind: "trait",
    page: 41,
    traits: [
      { name: "Content", max: "4" },
      { name: "Form", max: "2" },
      { name: "Grammar", max: "2" },
      { name: "Vocabulary", max: "2" },
      { name: "Spelling", max: "2" },
    ],
    gate: true,
    en: "Form 2 = 50–70 words; 1 = 40–49 or 71–100; 0 = anything else.",
    vi: "Form 2 = 50–70 từ; 1 = 40–49 hoặc 71–100 từ; 0 = ngoài khoảng đó.",
  },
  MC_LISTENING_MULTIPLE: OBJECTIVE("partial", 44, "+1 per correct option, −1 per wrong option, never below 0.", "Chọn đúng +1, chọn sai −1, thấp nhất là 0."),
  FILL_IN_THE_BLANKS_TYPE_IN: OBJECTIVE("partial", 44, "1 point per word typed and spelled correctly.", "Mỗi từ gõ đúng chính tả được 1 điểm."),
  HIGHLIGHT_CORRECT_SUMMARY: OBJECTIVE("correct", 44, "1 point if correct, 0 if not.", "Đúng 1 điểm, sai 0."),
  MC_LISTENING_SINGLE: OBJECTIVE("correct", 44, "1 point if correct, 0 if not.", "Đúng 1 điểm, sai 0."),
  SELECT_MISSING_WORD: OBJECTIVE("correct", 44, "1 point if correct, 0 if not.", "Đúng 1 điểm, sai 0."),
  HIGHLIGHT_INCORRECT_WORDS: OBJECTIVE("partial", 44, "+1 per correctly clicked word, −1 per wrong click, never below 0.", "Bấm đúng từ sai +1, bấm nhầm −1, thấp nhất là 0."),
  WRITE_FROM_DICTATION: OBJECTIVE("partial", 44, "1 point per word written and spelled correctly.", "Mỗi từ viết đúng chính tả được 1 điểm."),
};
