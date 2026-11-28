import { describe, expect, it } from "vitest";
import { LAB_SPECS } from "../../../../features/aboutPte/constants/labItems";
import { PTE_SCORE_EXAMPLES } from "../../../../features/aboutPte/constants/scoreConversion";
import { STANDARD_TASK_WEIGHTS } from "../../../../features/aboutPte/constants/scoringWeights";
import { scoreLab, valuesAtLevel, valuesForTarget } from "../../../../features/aboutPte/utils/labScoring";

const MAX_GAP = 2;

describe("score lab presets", () => {
  it.each(PTE_SCORE_EXAMPLES)("lands within %i ± %i of the target Overall", (target) => {
    const overall = scoreLab(valuesForTarget(target)).overall.score;
    expect(overall).not.toBeNull();
    expect(Math.abs((overall ?? 0) - target)).toBeLessThanOrEqual(MAX_GAP);
  });

  it("gives every question type a value for each of its controls, within the control's range", () => {
    const values = valuesForTarget(65);
    for (const task of STANDARD_TASK_WEIGHTS) {
      const controls = LAB_SPECS[task.key].controls;
      expect(values[task.key]).toHaveLength(controls.length);
      controls.forEach((control, index) => {
        expect(values[task.key][index]).toBeGreaterThanOrEqual(0);
        expect(values[task.key][index]).toBeLessThanOrEqual(control.max);
      });
    }
  });

  it("never lets a gated trait fall to 0 and zero a whole item", () => {
    const values = valuesAtLevel(0.05);
    for (const task of STANDARD_TASK_WEIGHTS) {
      LAB_SPECS[task.key].controls.forEach((control, index) => {
        if (control.gate) expect(values[task.key][index]).toBeGreaterThanOrEqual(1);
      });
    }
  });

  it("scores higher candidates higher", () => {
    const low = scoreLab(valuesForTarget(40)).overall.score ?? 0;
    const high = scoreLab(valuesForTarget(75)).overall.score ?? 0;
    expect(high).toBeGreaterThan(low);
  });

  it("reaches the top of the scale at full marks", () => {
    expect(scoreLab(valuesAtLevel(1)).overall.score).toBe(90);
  });
});
