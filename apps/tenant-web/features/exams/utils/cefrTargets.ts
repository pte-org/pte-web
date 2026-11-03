/** The CEFR levels a mix can use, easiest first. */
export const CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;

export type CefrLevel = (typeof CEFR_LEVELS)[number];

/** How the centre wants the difficulty of an exam decided. */
export type DifficultyMode = "TEMPLATE" | "BAND" | "CUSTOM";

export interface DifficultySelection {
  mode: DifficultyMode;
  /** For a band: the easiest and the hardest level; questions are spread evenly over the levels between. */
  bandFrom: CefrLevel;
  bandTo: CefrLevel;
  /** For a custom mix: the percent of each level as typed. */
  mix: Record<CefrLevel, string>;
}

export interface CefrTargetPayload {
  level: CefrLevel;
  percent: number;
}

const TOTAL_PERCENT = 100;

export const emptyMix = (): Record<CefrLevel, string> => ({
  A1: "",
  A2: "",
  B1: "",
  B2: "",
  C1: "",
  C2: "",
});

/** Follow the template's own mix, which for a Pearson-standard template is the standard one. */
export const defaultDifficulty = (): DifficultySelection => ({
  mode: "TEMPLATE",
  bandFrom: "B1",
  bandTo: "C2",
  mix: emptyMix(),
});

const percentOf = (value: string): number => (value.trim() === "" ? 0 : Number(value));

export const mixTotal = (mix: Record<CefrLevel, string>): number =>
  CEFR_LEVELS.reduce((sum, level) => sum + percentOf(mix[level]), 0);

/** True when every typed value is a whole number from 0 to 100 and the total is exactly 100. */
export const isValidMix = (mix: Record<CefrLevel, string>): boolean =>
  CEFR_LEVELS.every((level) => {
    const value = percentOf(mix[level]);
    return Number.isInteger(value) && value >= 0 && value <= TOTAL_PERCENT;
  }) && mixTotal(mix) === TOTAL_PERCENT;

/**
 * An even spread over the levels from `from` to `to` (in either order); the remainder of the division goes
 * one percent at a time to the easiest levels, so the shares always add up to 100.
 */
export const bandTargets = (from: CefrLevel, to: CefrLevel): CefrTargetPayload[] => {
  const first = Math.min(CEFR_LEVELS.indexOf(from), CEFR_LEVELS.indexOf(to));
  const last = Math.max(CEFR_LEVELS.indexOf(from), CEFR_LEVELS.indexOf(to));
  const levels = CEFR_LEVELS.slice(first, last + 1);
  const share = Math.floor(TOTAL_PERCENT / levels.length);
  const remainder = TOTAL_PERCENT - share * levels.length;
  return levels.map((level, index) => ({ level, percent: share + (index < remainder ? 1 : 0) }));
};

/** What to send as the exam's CEFR mix; undefined means "leave it out and follow the template". */
export const difficultyTargets = (
  selection: DifficultySelection | undefined,
): CefrTargetPayload[] | undefined => {
  if (!selection || selection.mode === "TEMPLATE") return undefined;
  if (selection.mode === "BAND") return bandTargets(selection.bandFrom, selection.bandTo);
  return CEFR_LEVELS.filter((level) => percentOf(selection.mix[level]) > 0).map((level) => ({
    level,
    percent: percentOf(selection.mix[level]),
  }));
};

/** True when the selection can be sent: only a custom mix can be wrong. */
export const isDifficultyValid = (selection: DifficultySelection | undefined): boolean =>
  !selection || selection.mode !== "CUSTOM" || isValidMix(selection.mix);

/** Whether the exam stays "Pearson standard": it follows a standard template and does not override its mix. */
export const isStandardExam = (
  selection: DifficultySelection | undefined,
  templateIsStandard: boolean | null | undefined,
): boolean => (!selection || selection.mode === "TEMPLATE") && templateIsStandard !== false;
