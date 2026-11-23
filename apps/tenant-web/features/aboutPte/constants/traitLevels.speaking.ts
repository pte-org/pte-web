/**
 * Speaking trait levels, paraphrased in our own words from the PTE Academic Score Guide
 * (2026, pp. 15–31 and 45–46). Level labels such as "Highly proficient" keep Pearson's names.
 */
export interface Localized {
  en: string;
  vi: string;
}

export interface TraitLevel {
  score: string;
  label?: string;
  text: Localized;
}

export interface TraitInfo {
  meaning: Localized;
  levels: readonly TraitLevel[];
}

const level = (score: string, en: string, vi: string, label?: string): TraitLevel => ({
  score,
  label,
  text: { en, vi },
});

export const PRONUNCIATION: TraitInfo = {
  meaning: {
    en: "How clearly sounds, word stress and sentence stress are produced, so that a regular English listener understands without effort.",
    vi: "Phát âm nguyên âm, phụ âm, trọng âm từ và trọng âm câu rõ đến đâu, để người nghe tiếng Anh bình thường hiểu mà không phải cố.",
  },
  levels: [
    level("5", "Every sound and stress pattern is natural; nothing is hard to understand.", "Mọi âm và trọng âm đều tự nhiên; không có chỗ nào khó hiểu.", "Highly proficient"),
    level("4", "Clear overall; a few small slips that never block understanding.", "Rõ ràng; có vài lỗi nhỏ nhưng không làm khó hiểu.", "Advanced"),
    level("3", "Mostly correct; some repeated errors make a few words unclear.", "Phần lớn đúng; một số lỗi lặp lại làm vài từ không rõ.", "Good"),
    level("2", "Noticeable accent; at least two thirds of the speech is understandable.", "Giọng lơ lớ rõ; người nghe hiểu được ít nhất 2/3 lời nói.", "Intermediate"),
    level("1", "Strong foreign accent; about a third of the words are hard to catch.", "Giọng nước ngoài nặng; khoảng 1/3 số từ khó nghe ra.", "Intrusive"),
    level("0", "Sounds like another language; more than half is not understandable.", "Nghe như một ngôn ngữ khác; hơn một nửa lời nói không hiểu được.", "Non-English"),
  ],
};

export const ORAL_FLUENCY: TraitInfo = {
  meaning: {
    en: "How smoothly the speech flows: rhythm, phrasing, and how many hesitations, repetitions, false starts or long pauses there are.",
    vi: "Lời nói trôi chảy đến đâu: nhịp, cách ngắt cụm, và có bao nhiêu lần ngập ngừng, lặp lại, nói lại từ đầu hay ngừng lâu.",
  },
  levels: [
    level("5", "Smooth rhythm and phrasing with no hesitation or repetition.", "Nhịp và ngắt cụm mượt mà, không ngập ngừng hay lặp lại.", "Highly proficient"),
    level("4", "Good rhythm; at most one hesitation, repetition or restart.", "Nhịp tốt; nhiều nhất một lần ngập ngừng, lặp lại hoặc nói lại.", "Advanced"),
    level("3", "Acceptable speed but uneven; a few hesitations, no long pauses.", "Tốc độ chấp nhận được nhưng chưa đều; vài lần ngập ngừng, không ngừng lâu.", "Good"),
    level("2", "Choppy; a few hesitations and possibly one long pause.", "Ngắt quãng, giật cục; vài lần ngập ngừng và có thể một lần ngừng lâu.", "Intermediate"),
    level("1", "Irregular rhythm; many hesitations make it clearly uneven.", "Nhịp thất thường; ngập ngừng nhiều khiến lời nói rõ ràng không liền mạch.", "Limited"),
    level("0", "Slow and laboured; mostly isolated words with long pauses.", "Chậm và nặng nhọc; chủ yếu là từ rời rạc, có nhiều lần ngừng lâu.", "Disfluent"),
  ],
};

export const CONTENT_READ_ALOUD: TraitInfo = {
  meaning: {
    en: "Whether every word of the passage was read. The maximum equals the number of words (N).",
    vi: "Có đọc đủ mọi từ trong đoạn văn không. Điểm tối đa bằng số từ của đoạn (N).",
  },
  levels: [
    level("N", "Every word read exactly as written.", "Đọc đúng và đủ mọi từ."),
    level("N − k", "One point lost for each word replaced, skipped or added (k errors).", "Mỗi từ đọc thay, bỏ sót hoặc chèn thêm trừ 1 điểm (k lỗi)."),
  ],
};

export const CONTENT_REPEAT_SENTENCE: TraitInfo = {
  meaning: {
    en: "How many words of the sentence were repeated in the right order. Hesitations are ignored.",
    vi: "Nhắc lại được bao nhiêu từ của câu theo đúng thứ tự. Tiếng ngập ngừng không bị tính.",
  },
  levels: [
    level("3", "All words in the correct order.", "Đủ mọi từ, đúng thứ tự."),
    level("2", "At least half of the words in order.", "Ít nhất một nửa số từ, đúng thứ tự."),
    level("1", "Less than half of the words in order.", "Dưới một nửa số từ đúng thứ tự."),
    level("0", "Almost nothing from the sentence.", "Gần như không nhắc lại được gì."),
  ],
};

/** Content 0–6 of Describe Image, Re-tell Lecture, Summarize Group Discussion and Respond to a Situation. */
export const CONTENT_SPEAKING: TraitInfo = {
  meaning: {
    en: "How completely and accurately the response covers what the prompt asks (the image, the lecture, the discussion or the situation), and how well ideas are linked and expressed.",
    vi: "Câu trả lời bao quát đầy đủ và chính xác đến đâu điều đề yêu cầu (hình ảnh, bài giảng, cuộc thảo luận hay tình huống), và các ý được liên kết, diễn đạt tốt đến đâu.",
  },
  levels: [
    level("6", "Full and accurate, explains relationships between ideas, varied and precise language.", "Đầy đủ, chính xác, giải thích được mối liên hệ giữa các ý, dùng từ đa dạng và chính xác."),
    level("5", "Main points accurate with some relationships; varied language; small details missing.", "Ý chính chính xác, có nêu vài mối liên hệ; dùng từ đa dạng; thiếu vài chi tiết nhỏ."),
    level("4", "Some accurate basic points but not all main points covered; some repetition.", "Có vài ý cơ bản đúng nhưng chưa đủ các ý chính; còn lặp từ."),
    level("3", "Mostly surface-level with small mistakes; narrow, repetitive language.", "Chủ yếu nói hời hợt, có sai sót nhỏ; vốn từ hẹp, lặp lại."),
    level("2", "Very few, shallow points with some mistakes; simple language dominates.", "Rất ít ý, hời hợt, có sai sót; chủ yếu câu đơn giản."),
    level("1", "Only disconnected words or a list of points, no real explanation.", "Chỉ là các từ rời rạc hoặc liệt kê, không giải thích gì."),
    level("0", "Too little to score, off-topic, or a memorised template — the whole item scores 0.", "Quá ít để chấm, lạc đề hoặc dùng bài học thuộc — cả câu được 0."),
  ],
};

export const VOCABULARY_SHORT_ANSWER: TraitInfo = {
  meaning: {
    en: "Whether the one- or few-word answer is the right word for the question.",
    vi: "Câu trả lời một vài từ có đúng từ cần thiết cho câu hỏi hay không.",
  },
  levels: [
    level("1", "Appropriate word.", "Đúng từ cần thiết."),
    level("0", "Wrong or inappropriate word.", "Sai hoặc không phù hợp."),
  ],
};
