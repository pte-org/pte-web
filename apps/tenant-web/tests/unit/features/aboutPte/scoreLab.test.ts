import { describe, expect, it } from "vitest";
import { initialLabOutcomes, scoreLab } from "../../../../features/aboutPte/hooks/useScoreLab";
import { SKILLS, STANDARD_TASK_WEIGHTS } from "../../../../features/aboutPte/constants/scoringWeights";

const all = (outcome: "correct" | "partial" | "wrong") =>
  Object.fromEntries(STANDARD_TASK_WEIGHTS.map((task) => [task.key, outcome]));

describe("score lab", () => {
  it("maps all correct / half / wrong to 90 / 50 / 10 for every skill and Overall", () => {
    for (const [outcome, expected] of [["correct", 90], ["partial", 50], ["wrong", 10]] as const) {
      const result = scoreLab(all(outcome));
      expect(result.overall.score).toBe(expected);
      for (const skill of SKILLS) expect(result.skills[skill].score).toBe(expected);
    }
  });

  it("moves both skills when an integrated question type changes", () => {
    const base = all("wrong");
    const result = scoreLab({ ...base, WRITE_FROM_DICTATION: "correct" });
    expect(result.skills.writing.score).toBeGreaterThan(10);
    expect(result.skills.listening.score).toBeGreaterThan(10);
    expect(result.skills.reading.score).toBe(10);
    expect(result.skills.speaking.score).toBe(10);
  });

  it("starts from a mixed result strictly between the extremes", () => {
    const overall = scoreLab(initialLabOutcomes()).overall.score ?? 0;
    expect(overall).toBeGreaterThan(10);
    expect(overall).toBeLessThan(90);
  });
});
