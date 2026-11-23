import { describe, expect, it } from "vitest";
import { initialLabValues, scoreLab } from "../../../../features/aboutPte/hooks/useScoreLab";
import { LAB_SPECS, labItemScore } from "../../../../features/aboutPte/constants/labItems";
import { SKILLS, STANDARD_TASK_WEIGHTS } from "../../../../features/aboutPte/constants/scoringWeights";

const extreme = (best: boolean) =>
  Object.fromEntries(
    STANDARD_TASK_WEIGHTS.map((task) => [
      task.key,
      LAB_SPECS[task.key].controls.map((c) => (best === (c.key !== "wrongPicks") ? c.max : 0)),
    ]),
  );

describe("score lab item rules", () => {
  it("has a spec for every question type", () => {
    for (const task of STANDARD_TASK_WEIGHTS) expect(LAB_SPECS[task.key], task.key).toBeDefined();
  });

  it("scores Describe Image by traits and applies the Content gate", () => {
    const spec = LAB_SPECS.DESCRIBE_IMAGE;
    expect(labItemScore(spec, [4, 3, 2])).toBe(56);
    expect(labItemScore(spec, [0, 5, 5])).toBe(0);
  });

  it("applies the Form gate to writing tasks", () => {
    expect(labItemScore(LAB_SPECS.WRITE_ESSAY, [6, 0, 6, 2, 6, 2, 2])).toBe(0);
  });

  it("uses +1/-1 with a floor of 0 for multiple answers", () => {
    const spec = LAB_SPECS.MC_READING_MULTIPLE;
    expect(labItemScore(spec, [3, 1])).toBe(67);
    expect(labItemScore(spec, [1, 2])).toBe(0);
  });

  it("scores counts as a share of the maximum", () => {
    expect(labItemScore(LAB_SPECS.FILL_IN_THE_BLANKS_DROPDOWN, [3])).toBe(75);
    expect(labItemScore(LAB_SPECS.WRITE_FROM_DICTATION, [7])).toBe(70);
  });
});

describe("score lab totals", () => {
  it("maps best and worst answers to 90 and 10", () => {
    expect(scoreLab(extreme(true)).overall.score).toBe(90);
    expect(scoreLab(extreme(false)).overall.score).toBe(10);
    for (const skill of SKILLS) expect(scoreLab(extreme(true)).skills[skill].score).toBe(90);
  });

  it("starts strictly between the extremes", () => {
    const overall = scoreLab(initialLabValues()).overall.score ?? 0;
    expect(overall).toBeGreaterThan(10);
    expect(overall).toBeLessThan(90);
  });
});
