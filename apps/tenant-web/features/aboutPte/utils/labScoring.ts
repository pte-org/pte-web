import { LAB_SPECS, labItemScore, type LabControl } from "../constants/labItems";
import { STANDARD_TASK_WEIGHTS } from "../constants/scoringWeights";
import { scoreAttempt, type ScoredResult } from "./scoringEngine";

/** Control values per question type (trait levels, counts, picks). */
export type LabValues = Record<string, number[]>;

export const labItemScores = (values: LabValues): Record<string, number> =>
  Object.fromEntries(STANDARD_TASK_WEIGHTS.map((task) => [task.key, labItemScore(LAB_SPECS[task.key], values[task.key])]));

/** One sample item per question type, so the type's average equals that item's score. */
export const scoreLab = (values: LabValues): ScoredResult => {
  const items = labItemScores(values);
  return scoreAttempt(
    STANDARD_TASK_WEIGHTS,
    Object.fromEntries(Object.entries(items).map(([key, score]) => [key, [score]])),
  );
};

const LEVEL_STEPS = 100;

/** A control at `level` (0–1) of its maximum. Wrong picks shrink as the level rises, and a gated trait never drops to 0. */
const controlAtLevel = (control: LabControl, level: number): number => {
  if (control.key === "wrongPicks") return Math.round(control.max * (1 - level));
  const value = Math.round(control.max * level);
  return control.gate ? Math.max(1, value) : value;
};

/** Every question type answered at the same share of its maximum: a steady candidate at that level. */
export const valuesAtLevel = (level: number): LabValues =>
  Object.fromEntries(
    STANDARD_TASK_WEIGHTS.map((task) => [task.key, LAB_SPECS[task.key].controls.map((control) => controlAtLevel(control, level))]),
  );

/** The steady candidate whose Overall score lands closest to `target`; the lower level wins a tie. */
export const valuesForTarget = (target: number): LabValues => {
  let best = valuesAtLevel(0);
  let bestGap = Number.POSITIVE_INFINITY;
  for (let step = 0; step <= LEVEL_STEPS; step += 1) {
    const values = valuesAtLevel(step / LEVEL_STEPS);
    const gap = Math.abs((scoreLab(values).overall.score ?? 0) - target);
    if (gap < bestGap) {
      best = values;
      bestGap = gap;
    }
  }
  return best;
};
