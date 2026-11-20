import { describe, expect, it } from "vitest";
import { SKILLS, STANDARD_TASK_WEIGHTS, type TaskWeight } from "../../../../features/aboutPte/constants/scoringWeights";
import { INITIAL_ANSWERS, SIM_TASKS, TASK_NAMES, toItemScores } from "../../../../features/aboutPte/constants/miniExam";
import {
  breakdown,
  scoreAttempt,
  taskAverages,
  weightedScore,
} from "../../../../features/aboutPte/utils/scoringEngine";
import { ABOUT_PTE_EN } from "../../../../features/aboutPte/constants/aboutPteCopy.en";
import { ABOUT_PTE_VI } from "../../../../features/aboutPte/constants/aboutPteCopy.vi";
import { TASK_GUIDE } from "../../../../features/aboutPte/constants/taskGuide";
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
    expect(scoreAttempt(STANDARD_TASK_WEIGHTS, uniform(0)).overall.score).toBe(10);
    expect(scoreAttempt(STANDARD_TASK_WEIGHTS, uniform(100)).overall.score).toBe(90);
    const half = scoreAttempt(STANDARD_TASK_WEIGHTS, uniform(50));
    expect(half.overall.score).toBe(50);
    for (const skill of SKILLS) expect(half.skills[skill].score).toBe(50);
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
    expect(result.skills.writing.score).toBe(Math.floor(10 + 80 * 0.26 + 0.5));
    expect(result.skills.listening.score).toBe(Math.floor(10 + 80 * 0.14 + 0.5));
    expect(result.skills.reading.score).toBe(10);
  });
});

describe("mini exam simulation", () => {
  it("covers all 22 question types", () => {
    expect(SIM_TASKS).toHaveLength(22);
  });

  it("scores a half-correct Write From Dictation into both Writing and Listening", () => {
    const answers = {
      ...INITIAL_ANSWERS[0],
      WRITE_FROM_DICTATION: ["correct", "wrong"] as const,
    };
    const result = scoreAttempt(SIM_TASKS, toItemScores({ ...answers, WRITE_FROM_DICTATION: [...answers.WRITE_FROM_DICTATION] }));
    const writing = result.skills.writing.terms.find((term) => term.key === "WRITE_FROM_DICTATION");
    const listening = result.skills.listening.terms.find((term) => term.key === "WRITE_FROM_DICTATION");
    expect(writing).toEqual({ key: "WRITE_FROM_DICTATION", weight: 26, average: 50, contribution: 13 });
    expect(listening).toEqual({ key: "WRITE_FROM_DICTATION", weight: 14, average: 50, contribution: 7 });
  });

  it("normalizes over the question types present (Writing = SWT + WFD only)", () => {
    const writing = breakdown(SIM_TASKS, { SUMMARIZE_WRITTEN_TEXT: 100, WRITE_FROM_DICTATION: 0 }, (task) => task.writing);
    expect(writing.totalWeight).toBe(51.5);
    expect(writing.weightedSum).toBe(25.5);
    expect(writing.score).toBe(Math.floor(10 + (80 * 25.5) / 51.5 + 0.5));
  });

  it("ranks the three preset students strong > mixed > weak", () => {
    const overall = INITIAL_ANSWERS.map((answers) => scoreAttempt(SIM_TASKS, toItemScores(answers)).overall.score ?? 0);
    expect(overall[0]).toBeGreaterThan(overall[1]);
    expect(overall[1]).toBeGreaterThan(overall[2]);
  });
});

describe("copy catalogs", () => {
  it("keeps VI and EN in the same shape", () => {
    expect(ABOUT_PTE_VI.hero.toc).toHaveLength(ABOUT_PTE_EN.hero.toc.length);
    expect(ABOUT_PTE_VI.comparison.rows).toHaveLength(ABOUT_PTE_EN.comparison.rows.length);
    expect(ABOUT_PTE_VI.simulation.stages).toHaveLength(ABOUT_PTE_EN.simulation.stages.length);
    for (const task of SIM_TASKS) {
      expect(TASK_NAMES[task.key], task.key).toBeTruthy();
      expect(TASK_GUIDE[task.key]?.vi, task.key).toBeTruthy();
    }
  });

  it("cites only sources that exist", () => {
    const ids = new Set(ABOUT_PTE_SOURCES.map((source) => source.id));
    const cited = JSON.stringify(ABOUT_PTE_EN).match(/"src":\[[\d,]*\]/g) ?? [];
    for (const group of cited) {
      for (const id of group.match(/\d+/g) ?? []) expect(ids.has(Number(id)), id).toBe(true);
    }
  });
});
