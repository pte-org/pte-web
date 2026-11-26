/**
 * Typing paces of the live view, in characters a second. Time-based on purpose: a pace per animation frame ran more
 * than twice as fast on a 144 Hz screen as on a 60 Hz one.
 */
export const TYPING_SPEEDS = { slow: 15, normal: 30, fast: 60 } as const;
export type TypingSpeed = keyof typeof TYPING_SPEEDS;
export const TYPING_SPEED_ORDER: readonly TypingSpeed[] = ["slow", "normal", "fast"];
export const DEFAULT_TYPING_SPEED: TypingSpeed = "normal";
export const TYPING_SPEED_STORAGE_KEY = "pte.questionGeneration.typingSpeed";
export const MS_PER_SECOND = 1000;

const TYPING_TEXT_EN = {
  typingSpeed: "Typing speed",
  slow: "Slow",
  normal: "Normal",
  fast: "Fast",
  revealAll: "Show all",
};

export type TypingText = { [K in keyof typeof TYPING_TEXT_EN]: string };

export const TYPING_TEXT: { vi: TypingText; en: TypingText } = {
  en: TYPING_TEXT_EN,
  vi: {
    typingSpeed: "Tốc độ gõ",
    slow: "Chậm",
    normal: "Vừa",
    fast: "Nhanh",
    revealAll: "Hiện hết",
  },
};
