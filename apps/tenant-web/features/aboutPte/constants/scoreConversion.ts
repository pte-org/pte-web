/**
 * Pearson's published comparison of PTE Academic with IELTS Academic (concordance updated July 2025, source [15])
 * and with CEFR (source [16]). Each IELTS row is the lowest PTE score that reaches that band.
 */
export const IELTS_MINIMUMS: readonly { band: number; pte: number }[] = [
  { band: 4.5, pte: 24 },
  { band: 5, pte: 31 },
  { band: 5.5, pte: 39 },
  { band: 6, pte: 47 },
  { band: 6.5, pte: 55 },
  { band: 7, pte: 63 },
  { band: 7.5, pte: 71 },
  { band: 8, pte: 79 },
  { band: 8.5, pte: 86 },
  { band: 9, pte: 90 },
];

export type CefrLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

/** The lowest PTE score of each CEFR level, from A1 up. */
export const CEFR_MINIMUMS: readonly { level: CefrLevel; pte: number }[] = [
  { level: "A1", pte: 10 },
  { level: "A2", pte: 30 },
  { level: "B1", pte: 43 },
  { level: "B2", pte: 59 },
  { level: "C1", pte: 76 },
  { level: "C2", pte: 85 },
];

export const PTE_SCORE_MIN = 10;
export const PTE_SCORE_MAX = 90;
/** Where the converter starts, and the scores offered as one-click examples. */
export const PTE_SCORE_DEFAULT = 65;
export const PTE_SCORE_EXAMPLES: readonly number[] = [50, 65, 79];
