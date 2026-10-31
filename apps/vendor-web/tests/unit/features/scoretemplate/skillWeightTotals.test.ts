import { describe, expect, it } from "vitest";
import {
  computeSkillWeightTotals,
  describeSkillWeightMismatch,
} from "../../../../features/scoretemplate/skillWeightTotals";
import type { ScoreTemplateItemDraft } from "../../../../features/scoretemplate/types";

const labels = {
  SPEAKING: "Speaking",
  WRITING: "Writing",
  READING: "Reading",
  LISTENING: "Listening",
};

const item = (
  speaking: string,
  writing: string,
  reading: string,
  listening: string,
): ScoreTemplateItemDraft => ({
  taskType: "T",
  taskTypeKey: "T",
  section: "SPEAKING",
  sequence: 1,
  minCount: "1",
  maxCount: "1",
  prepSeconds: "0",
  responseSeconds: "0",
  overallWeight: "0",
  speakingWeight: speaking,
  writingWeight: writing,
  readingWeight: reading,
  listeningWeight: listening,
});

describe("skill weight totals", () => {
  it("accepts columns that total exactly 100 or carry no weight at all", () => {
    const items = [item("60", "0", "100", "0"), item("40", "0", "0", "0")];

    expect(computeSkillWeightTotals(items).every((entry) => entry.isValid)).toBe(true);
    expect(describeSkillWeightMismatch(items, labels)).toBeNull();
  });

  it("flags the off-by-one columns from the seeded template and names only those", () => {
    const items = [item("101", "100", "99.5", "0")];

    expect(describeSkillWeightMismatch(items, labels)).toBe("Speaking 101, Reading 99.5");
  });

  it("sums decimals without floating point drift and ignores blank inputs", () => {
    const items = [item("8.91", "", "", ""), item("91.09", "", "", "")];

    const speaking = computeSkillWeightTotals(items).find((entry) => entry.skill === "SPEAKING");
    expect(speaking).toEqual({ skill: "SPEAKING", total: 100, isValid: true });
  });
});
