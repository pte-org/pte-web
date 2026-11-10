import { describe, expect, it } from "vitest";
import {
  bandTargets,
  defaultDifficulty,
  difficultyTargets,
  emptyMix,
  isDifficultyValid,
  isStandardExam,
  isValidMix,
  mixTotal,
} from "../../../../../features/exams/utils/cefrTargets";

describe("CEFR difficulty selection", () => {
  it("leaves the mix out when the exam follows its template", () => {
    expect(difficultyTargets(defaultDifficulty())).toBeUndefined();
    expect(difficultyTargets(undefined)).toBeUndefined();
  });

  it("spreads a band evenly and gives the remainder to the easiest levels", () => {
    expect(bandTargets("A2", "B1")).toEqual([
      { level: "A2", percent: 50 },
      { level: "B1", percent: 50 },
    ]);
    const threeLevels = bandTargets("B1", "C1");
    expect(threeLevels.map((target) => target.percent)).toEqual([34, 33, 33]);
    expect(threeLevels.reduce((sum, target) => sum + target.percent, 0)).toBe(100);
  });

  it("reads a band whichever way round its ends are given", () => {
    expect(bandTargets("C2", "C1")).toEqual(bandTargets("C1", "C2"));
  });

  it("sends only the levels of a custom mix that are above 0", () => {
    const targets = difficultyTargets({
      ...defaultDifficulty(),
      mode: "CUSTOM",
      mix: { ...emptyMix(), A2: "20", B1: "50", B2: "30" },
    });

    expect(targets).toEqual([
      { level: "A2", percent: 20 },
      { level: "B1", percent: 50 },
      { level: "B2", percent: 30 },
    ]);
  });

  it("accepts a custom mix only when whole percents add up to 100", () => {
    expect(isValidMix({ ...emptyMix(), B1: "60", B2: "40" })).toBe(true);
    expect(isValidMix({ ...emptyMix(), B1: "60", B2: "30" })).toBe(false);
    expect(isValidMix({ ...emptyMix(), B1: "60.5", B2: "39.5" })).toBe(false);
    expect(mixTotal({ ...emptyMix(), B1: "60", B2: "30" })).toBe(90);
  });

  it("only a custom mix can make the selection invalid", () => {
    expect(isDifficultyValid(defaultDifficulty())).toBe(true);
    expect(isDifficultyValid({ ...defaultDifficulty(), mode: "BAND" })).toBe(true);
    expect(isDifficultyValid({ ...defaultDifficulty(), mode: "CUSTOM" })).toBe(false);
  });

  it("an exam is Pearson standard only while it follows a standard template", () => {
    expect(isStandardExam(defaultDifficulty(), true)).toBe(true);
    expect(isStandardExam(defaultDifficulty(), null)).toBe(true);
    expect(isStandardExam(defaultDifficulty(), false)).toBe(false);
    expect(isStandardExam({ ...defaultDifficulty(), mode: "BAND" }, true)).toBe(false);
  });
});
