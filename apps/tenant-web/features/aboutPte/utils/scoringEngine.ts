import {
  SCORE_FLOOR,
  SCORE_SPAN,
  SKILLS,
  type SkillKey,
  type TaskWeight,
} from "../constants/scoringWeights";

/** Item scores on the shared 0–100 scale, keyed by task type. */
export type ItemScores = Readonly<Record<string, readonly number[]>>;

export type SkillScores = Record<SkillKey, number>;

export interface ScoredResult {
  taskAverages: Record<string, number>;
  skills: SkillScores;
  overall: number;
}

const roundHalfUp = (value: number): number => Math.floor(value + 0.5);

/** Task-type average: blanks are already 0 in the list; a type with no items is left out. */
export const taskAverages = (scores: ItemScores): Record<string, number> =>
  Object.fromEntries(
    Object.entries(scores)
      .filter(([, items]) => items.length > 0)
      .map(([key, items]) => [key, items.reduce((sum, item) => sum + item, 0) / items.length]),
  );

/** 10 + 80 × Σ(w × avg / 100) / Σw, rounded half-up — the same formula as AggregationCore. */
export const weightedScore = (
  tasks: readonly TaskWeight[],
  averages: Readonly<Record<string, number>>,
  weightOf: (task: TaskWeight) => number,
): number | null => {
  let weightedSum = 0;
  let totalWeight = 0;
  for (const task of tasks) {
    const weight = weightOf(task);
    const average = averages[task.key];
    if (weight <= 0 || average === undefined) continue;
    weightedSum += (weight * average) / 100;
    totalWeight += weight;
  }
  if (totalWeight <= 0) return null;
  return roundHalfUp(SCORE_FLOOR + (SCORE_SPAN * weightedSum) / totalWeight);
};

export const scoreAttempt = (tasks: readonly TaskWeight[], scores: ItemScores): ScoredResult => {
  const averages = taskAverages(scores);
  const skills = Object.fromEntries(
    SKILLS.map((skill) => [skill, weightedScore(tasks, averages, (task) => task[skill]) ?? SCORE_FLOOR]),
  ) as SkillScores;
  const overall = weightedScore(tasks, averages, (task) => task.overall) ?? SCORE_FLOOR;
  return { taskAverages: averages, skills, overall };
};

export interface CohortSummary {
  mean: number;
  median: number;
  min: number;
  max: number;
}

export const summarize = (values: readonly number[]): CohortSummary => {
  if (values.length === 0) return { mean: 0, median: 0, min: 0, max: 0 };
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 === 0 ? (sorted[middle - 1] + sorted[middle]) / 2 : sorted[middle];
  return {
    mean: sorted.reduce((sum, value) => sum + value, 0) / sorted.length,
    median,
    min: sorted[0],
    max: sorted[sorted.length - 1],
  };
};

/** Counts per bucket of `size` points across the 10–90 scale (last bucket includes 90). */
export const histogram = (values: readonly number[], size = 10): { from: number; count: number }[] => {
  const buckets: { from: number; count: number }[] = [];
  for (let from = SCORE_FLOOR; from < SCORE_FLOOR + SCORE_SPAN; from += size) {
    buckets.push({ from, count: 0 });
  }
  for (const value of values) {
    const index = Math.min(buckets.length - 1, Math.max(0, Math.floor((value - SCORE_FLOOR) / size)));
    buckets[index].count += 1;
  }
  return buckets;
};
