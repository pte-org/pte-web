import { STANDARD_TASK_WEIGHTS, type TaskWeight } from "../constants/scoringWeights";
import type { ItemScores } from "./scoringEngine";

export interface MockStudent {
  id: number;
  code: string;
  ability: number;
  scores: ItemScores;
}

/** Deterministic PRNG (mulberry32) so the same seed always yields the same cohort. */
export const createRandom = (seed: number): (() => number) => {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const clamp = (value: number): number => Math.min(100, Math.max(0, value));

/** Objective tasks score whole items (0/100); the rest get a partial-credit score. */
const OBJECTIVE_TASKS = new Set([
  "MC_READING_SINGLE",
  "MC_LISTENING_SINGLE",
  "SELECT_MISSING_WORD",
  "HIGHLIGHT_CORRECT_SUMMARY",
]);

const BLANK_RATE = 0.03;
const NOISE_SPREAD = 36;

const itemScore = (task: TaskWeight, ability: number, random: () => number): number => {
  if (random() < BLANK_RATE) return 0;
  const noisy = ability + (random() - 0.5) * NOISE_SPREAD;
  if (OBJECTIVE_TASKS.has(task.key)) return random() * 100 < noisy ? 100 : 0;
  return Math.round(clamp(noisy));
};

export const generateStudents = (
  count: number,
  seed: number,
  tasks: readonly TaskWeight[] = STANDARD_TASK_WEIGHTS,
): MockStudent[] => {
  const random = createRandom(seed);
  return Array.from({ length: count }, (_, index) => {
    // Sum of three uniforms ≈ bell-shaped ability around 55%.
    const ability = clamp(15 + ((random() + random() + random()) / 3) * 80);
    const scores = Object.fromEntries(
      tasks.map((task) => [
        task.key,
        Array.from({ length: task.items }, () => itemScore(task, ability, random)),
      ]),
    );
    return {
      id: index + 1,
      code: `S${String(index + 1).padStart(3, "0")}`,
      ability: Math.round(ability),
      scores,
    };
  });
};
