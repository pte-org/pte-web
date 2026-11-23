/**
 * Writing trait levels, paraphrased in our own words from the PTE Academic Score Guide
 * (2026, pp. 32–43).
 */
import type { TraitInfo, TraitLevel } from "./traitLevels.speaking";

const level = (score: string, en: string, vi: string): TraitLevel => ({ score, text: { en, vi } });

/** Content 0–4 of Summarize Written Text and Summarize Spoken Text. */
export const CONTENT_SUMMARY: TraitInfo = {
  meaning: {
    en: "How well the summary captures the main ideas of the source in your own words, without unnecessary detail.",
    vi: "Bản tóm tắt nắm được ý chính của bài gốc bằng lời của mình đến đâu, có lược bỏ chi tiết thừa không.",
  },
  levels: [
    level("4", "Complete and concise; all main ideas, well paraphrased and smoothly linked.", "Đầy đủ, súc tích; đủ mọi ý chính, diễn đạt lại tốt, liên kết mượt."),
    level("3", "Good; main ideas present with small omissions, paraphrasing uneven.", "Tốt; có ý chính nhưng thiếu chút ít, diễn đạt lại chưa đều."),
    level("2", "Partial; mixes main and minor points, copies chunks of the source.", "Một phần; lẫn ý chính với ý phụ, chép nguyên đoạn từ bài gốc."),
    level("1", "Relevant but not really a summary; disconnected ideas.", "Có liên quan nhưng chưa thành bản tóm tắt; ý rời rạc."),
    level("0", "Shows no understanding, or memorised material — the whole item scores 0.", "Không thể hiện hiểu bài, hoặc dùng bài học thuộc — cả câu được 0."),
  ],
};

export const FORM_SUMMARY_WRITTEN: TraitInfo = {
  meaning: { en: "Length and shape of the answer, checked by counting.", vi: "Độ dài và hình thức câu trả lời, kiểm tra bằng cách đếm." },
  levels: [
    level("1", "One single complete sentence of 5–75 words.", "Đúng một câu hoàn chỉnh, 5–75 từ."),
    level("0", "More than one sentence, over 75 words, or all capitals — the whole item scores 0.", "Nhiều hơn một câu, quá 75 từ hoặc viết toàn chữ in hoa — cả câu được 0."),
  ],
};

export const FORM_SUMMARY_SPOKEN: TraitInfo = {
  meaning: FORM_SUMMARY_WRITTEN.meaning,
  levels: [
    level("2", "50–70 words.", "50–70 từ."),
    level("1", "40–49 or 71–100 words.", "40–49 hoặc 71–100 từ."),
    level("0", "Under 40 or over 100 words, all capitals, no punctuation or only bullet points — item scores 0.", "Dưới 40 hoặc trên 100 từ, toàn chữ in hoa, không dấu câu hoặc chỉ gạch đầu dòng — cả câu được 0."),
  ],
};

export const FORM_ESSAY: TraitInfo = {
  meaning: FORM_SUMMARY_WRITTEN.meaning,
  levels: [
    level("2", "200–300 words.", "200–300 từ."),
    level("1", "120–199 or 301–380 words.", "120–199 hoặc 301–380 từ."),
    level("0", "Under 120 or over 380 words, all capitals, no punctuation or only bullet points — item scores 0.", "Dưới 120 hoặc trên 380 từ, toàn chữ in hoa, không dấu câu hoặc chỉ gạch đầu dòng — cả câu được 0."),
  ],
};

export const CONTENT_ESSAY: TraitInfo = {
  meaning: {
    en: "How fully and convincingly the essay answers the prompt, with relevant support for its points.",
    vi: "Bài luận trả lời đề đầy đủ và thuyết phục đến đâu, các luận điểm có dẫn chứng phù hợp không.",
  },
  levels: [
    level("6", "Fully answers the prompt; convincing argument with strong support.", "Trả lời trọn vẹn đề; lập luận thuyết phục, dẫn chứng tốt."),
    level("5", "Answers the prompt well; main points supported with relevant detail.", "Trả lời tốt; luận điểm chính có chi tiết phù hợp."),
    level("4", "Adequately covers the main point; support strong for some points, weak for others.", "Đáp ứng đủ ý chính; có luận điểm được hỗ trợ tốt, có luận điểm yếu."),
    level("3", "Relevant but misses main points or gives little support.", "Liên quan đến đề nhưng bỏ sót ý chính hoặc ít dẫn chứng."),
    level("2", "Only loosely related to the prompt; ideas thin.", "Chỉ liên quan lỏng lẻo đến đề; ý mỏng."),
    level("1", "Barely addresses the prompt.", "Hầu như không trả lời đề."),
    level("0", "Off-topic or memorised material — the whole item scores 0.", "Lạc đề hoặc dùng bài học thuộc — cả câu được 0."),
  ],
};

export const DEVELOPMENT: TraitInfo = {
  meaning: {
    en: "Development, Structure & Coherence: whether the essay is organised logically, ideas are developed and linked with suitable connectors.",
    vi: "Phát triển, bố cục và mạch lạc: bài luận có sắp xếp hợp lý không, ý có được phát triển và nối bằng từ nối phù hợp không.",
  },
  levels: [
    level("6", "Clear logical structure; ideas fully developed and smoothly connected.", "Bố cục rõ, hợp lý; ý phát triển đầy đủ, liên kết mượt."),
    level("4–5", "Clear argument with some points developed at length; good linking.", "Lập luận rõ, một số ý được phát triển sâu; liên kết tốt."),
    level("2–3", "Mostly simple points or loosely connected ideas; basic connectors.", "Chủ yếu ý đơn giản hoặc rời rạc; dùng từ nối cơ bản."),
    level("0–1", "Little or no organisation or coherence between points.", "Gần như không có bố cục hay sự mạch lạc giữa các ý."),
  ],
};

export const GENERAL_RANGE: TraitInfo = {
  meaning: {
    en: "General Linguistic Range: how wide and flexible the language is for expressing ideas precisely.",
    vi: "Độ phong phú ngôn ngữ: vốn diễn đạt rộng và linh hoạt đến đâu để nói ý một cách chính xác.",
  },
  levels: [
    level("6", "Wide range used precisely and naturally; no limitation on what can be said.", "Diễn đạt phong phú, chính xác, tự nhiên; không bị giới hạn."),
    level("4–5", "Good range; ideas expressed clearly with occasional imprecision.", "Vốn diễn đạt tốt; ý rõ ràng, thỉnh thoảng thiếu chính xác."),
    level("2–3", "Limited vocabulary and simple expressions; some ideas unclear.", "Từ vựng hạn chế, câu đơn giản; một số ý chưa rõ."),
    level("0–1", "Very restricted language; errors block meaning.", "Ngôn ngữ rất hạn chế; lỗi làm mất nghĩa."),
  ],
};

const twoOneZero = (en: [string, string, string], vi: [string, string, string]): TraitLevel[] => [
  level("2", en[0], vi[0]),
  level("1", en[1], vi[1]),
  level("0", en[2], vi[2]),
];

export const GRAMMAR: TraitInfo = {
  meaning: { en: "Correctness of sentence structure.", vi: "Độ chính xác của cấu trúc câu." },
  levels: twoOneZero(
    ["Correct grammar.", "Errors that do not block understanding.", "Errors that could block understanding."],
    ["Ngữ pháp đúng.", "Có lỗi nhưng không cản trở việc hiểu.", "Lỗi có thể khiến người đọc không hiểu."],
  ),
};

export const VOCABULARY: TraitInfo = {
  meaning: { en: "Whether word choice is appropriate.", vi: "Chọn từ có phù hợp hay không." },
  levels: twoOneZero(
    ["Appropriate word choice.", "Word errors that do not block understanding.", "Word choice that could block understanding."],
    ["Chọn từ phù hợp.", "Có lỗi dùng từ nhưng không cản trở việc hiểu.", "Chọn từ sai có thể khiến người đọc không hiểu."],
  ),
};

export const VOCABULARY_RANGE: TraitInfo = {
  meaning: { en: "How broad the vocabulary is, including idioms.", vi: "Vốn từ rộng đến đâu, kể cả thành ngữ." },
  levels: twoOneZero(
    ["Broad vocabulary with idiomatic expressions.", "Good academic vocabulary with some imprecision.", "Mainly basic vocabulary, not enough for the topic."],
    ["Vốn từ rộng, dùng được thành ngữ.", "Từ vựng học thuật khá, đôi chỗ chưa chính xác.", "Chủ yếu từ cơ bản, chưa đủ cho chủ đề."],
  ),
};

export const SPELLING: TraitInfo = {
  meaning: { en: "Number of spelling mistakes.", vi: "Số lỗi chính tả." },
  levels: twoOneZero(
    ["No spelling errors.", "One spelling error.", "More than one spelling error."],
    ["Không có lỗi chính tả.", "Một lỗi chính tả.", "Nhiều hơn một lỗi chính tả."],
  ),
};
