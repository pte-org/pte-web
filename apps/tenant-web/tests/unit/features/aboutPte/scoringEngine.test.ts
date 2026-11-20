import { describe, expect, it } from "vitest";
import { SKILLS, STANDARD_TASK_WEIGHTS, type TaskWeight } from "../../../../features/aboutPte/constants/scoringWeights";
import { generateStudents } from "../../../../features/aboutPte/utils/mockStudents";
import {
  histogram,
  scoreAttempt,
  summarize,
  taskAverages,
  weightedScore,
} from "../../../../features/aboutPte/utils/scoringEngine";
import { ABOUT_PTE_EN } from "../../../../features/aboutPte/constants/aboutPteCopy.en";
import { ABOUT_PTE_VI } from "../../../../features/aboutPte/constants/aboutPteCopy.vi";
import { ABOUT_PTE_SOURCES } from "../../../../features/aboutPte/constants/aboutPteSources";

const uniform = (score: number): Record<string, number[]> =>
  Object.fromEntries(STANDARD_TASK_WEIGHTS.map((task) => [task.key, Array(task.items).fill(score)]));

describe("standard template weights", () => {
  it("sums every skill column to 100, mirroring migration V24", () => {
    for (const skill of SKILLS) {
      const total = STANDARD_TASK_WEIGHTS.reduce((sum, task) => sum + task[skill], 0);
      expect(total, skill).toBeCloseTo(100, 5);
    }
  });

  it("keeps overall weight as the mean of the four skill weights", () => {
    for (const task of STANDARD_TASK_WEIGHTS) {
      const mean = SKILLS.reduce((sum, skill) => sum + task[skill], 0) / 4;
      expect(task.overall, task.key).toBeCloseTo(mean, 1);
    }
  });
});

describe("scoring engine (AggregationCore formula)", () => {
  it("maps 0% to 10, 100% to 90 and 50% to 50", () => {
    expect(scoreAttempt(STANDARD_TASK_WEIGHTS, uniform(0)).overall).toBe(10);
    expect(scoreAttempt(STANDARD_TASK_WEIGHTS, uniform(100)).overall).toBe(90);
    const half = scoreAttempt(STANDARD_TASK_WEIGHTS, uniform(50));
    expect(half.overall).toBe(50);
    for (const skill of SKILLS) expect(half.skills[skill]).toBe(50);
  });

  it("counts blanks as 0 in the task average", () => {
    expect(taskAverages({ A: [100, 0, 50] })).toEqual({ A: 50 });
  });

  it("excludes task types without an average from both sums", () => {
    const tasks: TaskWeight[] = [
      { key: "A", section: "reading", items: 1, speaking: 0, writing: 0, reading: 60, listening: 0, overall: 15 },
      { key: "B", section: "reading", items: 1, speaking: 0, writing: 0, reading: 40, listening: 0, overall: 10 },
    ];
    expect(weightedScore(tasks, { A: 100 }, (task) => task.reading)).toBe(90);
    expect(weightedScore(tasks, {}, (task) => task.reading)).toBeNull();
  });

  it("weights integrated tasks into more than one skill", () => {
    const scores = uniform(0);
    scores.WRITE_FROM_DICTATION = [100, 100, 100];
    const result = scoreAttempt(STANDARD_TASK_WEIGHTS, scores);
    expect(result.skills.writing).toBe(Math.floor(10 + 80 * 0.26 + 0.5));
    expect(result.skills.listening).toBe(Math.floor(10 + 80 * 0.14 + 0.5));
    expect(result.skills.reading).toBe(10);
  });
});

describe("mock cohort", () => {
  it("is deterministic per seed and has 50 students scored within 10–90", () => {
    const first = generateStudents(50, 7);
    expect(first).toEqual(generateStudents(50, 7));
    expect(first).toHaveLength(50);
    const overall = first.map((student) => scoreAttempt(STANDARD_TASK_WEIGHTS, student.scores).overall);
    for (const value of overall) {
      expect(value).toBeGreaterThanOrEqual(10);
      expect(value).toBeLessThanOrEqual(90);
    }
    expect(histogram(overall).reduce((sum, bucket) => sum + bucket.count, 0)).toBe(50);
  });

  it("summarizes a cohort", () => {
    expect(summarize([10, 50, 90, 30])).toEqual({ mean: 45, median: 40, min: 10, max: 90 });
  });
});

describe("copy catalogs", () => {
  it("keeps VI and EN in the same shape", () => {
    expect(ABOUT_PTE_VI.hero.toc).toHaveLength(ABOUT_PTE_EN.hero.toc.length);
    expect(ABOUT_PTE_VI.comparison.rows).toHaveLength(ABOUT_PTE_EN.comparison.rows.length);
    expect(ABOUT_PTE_VI.simulation.stages).toHaveLength(ABOUT_PTE_EN.simulation.stages.length);
  });

  it("cites only sources that exist", () => {
    const ids = new Set(ABOUT_PTE_SOURCES.map((source) => source.id));
    const cited = JSON.stringify(ABOUT_PTE_EN).match(/"src":\[[\d,]*\]/g) ?? [];
    for (const group of cited) {
      for (const id of group.match(/\d+/g) ?? []) expect(ids.has(Number(id)), id).toBe(true);
    }
  });
});
