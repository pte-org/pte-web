import {
  SCORE_FLOOR,
  SCORE_SPAN,
  SKILLS,
  type SkillKey,
  type TaskWeight,
} from "../constants/scoringWeights";

/** Item scores on the shared 0–100 scale, keyed by task type. */
export type ItemScores = Readonly<Record<string, readonly number[]>>;

export type SkillScores = Record<SkillKey, number | null>;

export interface BreakdownTerm {
  key: string;
  weight: number;
  average: number;
  contribution: number;
}

/** One skill's (or Overall's) sum, term by term — the same trace AggregationCore keeps. */
export interface Breakdown {
  terms: BreakdownTerm[];
  weightedSum: number;
  totalWeight: number;
  score: number | null;
}

export interface ScoredResult {
  taskAverages: Record<string, number>;
  skills: Record<SkillKey, Breakdown>;
  overall: Breakdown;
}

const roundHalfUp = (value: number): number => Math.floor(value + 0.5);

/** Task-type average: blanks are already 0 in the list; a type with no items is left out. */
export const taskAverages = (scores: ItemScores): Record<string, number> =>
  Object.fromEntries(
    Object.entries(scores)
      .filter(([, items]) => items.length > 0)
      .map(([key, items]) => [key, items.reduce((sum, item) => sum + item, 0) / items.length]),
  );

/** 10 + 80 × Σ(w × avg / 100) / Σw, rounded half-up, over task types with weight and an average. */
export const breakdown = (
  tasks: readonly TaskWeight[],
  averages: Readonly<Record<string, number>>,
  weightOf: (task: TaskWeight) => number,
): Breakdown => {
  const terms = tasks
    .filter((task) => weightOf(task) > 0 && averages[task.key] !== undefined)
    .map((task) => {
      const weight = weightOf(task);
      const average = averages[task.key];
      return { key: task.key, weight, average, contribution: (weight * average) / 100 };
    });
  const weightedSum = terms.reduce((sum, term) => sum + term.contribution, 0);
  const totalWeight = terms.reduce((sum, term) => sum + term.weight, 0);
  const score = totalWeight > 0 ? roundHalfUp(SCORE_FLOOR + (SCORE_SPAN * weightedSum) / totalWeight) : null;
  return { terms, weightedSum, totalWeight, score };
};

export const weightedScore = (
  tasks: readonly TaskWeight[],
  averages: Readonly<Record<string, number>>,
  weightOf: (task: TaskWeight) => number,
): number | null => breakdown(tasks, averages, weightOf).score;

export const scoreAttempt = (tasks: readonly TaskWeight[], scores: ItemScores): ScoredResult => {
  const averages = taskAverages(scores);
  const skills = Object.fromEntries(
    SKILLS.map((skill) => [skill, breakdown(tasks, averages, (task) => task[skill])]),
  ) as Record<SkillKey, Breakdown>;
  return { taskAverages: averages, skills, overall: breakdown(tasks, averages, (task) => task.overall) };
};

/** Trims floating noise for display, e.g. 12.750000001 → "12.75". */
export const formatNumber = (value: number): string => String(Math.round(value * 100) / 100);
