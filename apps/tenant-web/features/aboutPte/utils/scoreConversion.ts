import {
  CEFR_MINIMUMS,
  IELTS_MINIMUMS,
  PTE_SCORE_MAX,
  PTE_SCORE_MIN,
  type CefrLevel,
} from "../constants/scoreConversion";

/** A score kept inside the PTE 10–90 scale and on whole points. */
export function clampPteScore(score: number): number {
  return Math.min(PTE_SCORE_MAX, Math.max(PTE_SCORE_MIN, Math.round(score)));
}

/** The highest IELTS band Pearson's table puts this PTE score at or above; null below band 4.5, where it lists none. */
export function ieltsBandFor(score: number): number | null {
  const reached = IELTS_MINIMUMS.filter((row) => clampPteScore(score) >= row.pte);
  return reached.length > 0 ? reached[reached.length - 1].band : null;
}

/** The CEFR level of this PTE score. */
export function cefrLevelFor(score: number): CefrLevel {
  const clamped = clampPteScore(score);
  const reached = CEFR_MINIMUMS.filter((row) => clamped >= row.pte);
  return reached[reached.length - 1].level;
}

/** IELTS bands are written with one decimal: 6.0, 6.5. */
export function formatIeltsBand(band: number): string {
  return band.toFixed(1);
}
