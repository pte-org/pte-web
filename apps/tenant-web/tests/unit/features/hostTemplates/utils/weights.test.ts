import { describe, expect, it } from "vitest";
import type { ScoreTemplateItemRequest, ScoreTemplateItemResponse } from "@pte/api-client";
import {
  applySuggestedColumn,
  areWeightsValid,
  buildWeightEditableCheck,
  computeSkillTotals,
  formatWeight,
  removeItem,
} from "../../../../../features/hostTemplates/utils/weights";

type Weights = Partial<
  Pick<
    ScoreTemplateItemRequest,
    "speakingWeight" | "writingWeight" | "readingWeight" | "listeningWeight"
  >
>;

const item = (key: string, section: string, weights: Weights, sequence = 1): ScoreTemplateItemRequest => ({
  taskTypeKey: key,
  section,
  sequence,
  minCount: 1,
  maxCount: 1,
  prepSeconds: 0,
  responseSeconds: 0,
  speakingWeight: 0,
  writingWeight: 0,
  readingWeight: 0,
  listeningWeight: 0,
  ...weights,
});

describe("buildWeightEditableCheck", () => {
  const asResponse = (rows: ScoreTemplateItemRequest[]): ScoreTemplateItemResponse[] =>
    rows as unknown as ScoreTemplateItemResponse[];

  it("only lets the host tune the skills the default credits for that task type", () => {
    const base = asResponse([
      item("REPEAT_SENTENCE", "SPEAKING", { speakingWeight: 16, listeningWeight: 17 }),
    ]);
    const editable = buildWeightEditableCheck(base, base);
    expect(editable("REPEAT_SENTENCE", "SPEAKING")).toBe(true);
    expect(editable("REPEAT_SENTENCE", "LISTENING")).toBe(true);
    expect(editable("REPEAT_SENTENCE", "READING")).toBe(false);
    expect(editable("REPEAT_SENTENCE", "WRITING")).toBe(false);
  });

  it("falls back to the template's own weights when the default lacks the task type", () => {
    const own = asResponse([item("ONLY_HERE", "READING", { readingWeight: 40 })]);
    const editable = buildWeightEditableCheck(undefined, own);
    expect(editable("ONLY_HERE", "READING")).toBe(true);
    expect(editable("ONLY_HERE", "SPEAKING")).toBe(false);
    expect(editable("UNKNOWN", "READING")).toBe(false);
  });
});

describe("computeSkillTotals", () => {
  it("accepts a skill with no own tasks and no weight as 0", () => {
    const totals = computeSkillTotals([item("A", "SPEAKING", { speakingWeight: 100 })]);
    expect(totals.find((t) => t.skill === "READING")).toMatchObject({ total: 0, ok: true });
    expect(areWeightsValid(totals)).toBe(true);
  });

  it("requires exactly 100 when the skill's own part still has tasks", () => {
    const totals = computeSkillTotals([item("A", "READING", { readingWeight: 80 })]);
    expect(totals.find((t) => t.skill === "READING")).toMatchObject({ hasOwnTasks: true, ok: false });
    expect(areWeightsValid(totals)).toBe(false);
  });

  it("lets tasks of other parts carry a skill's weight", () => {
    const totals = computeSkillTotals([
      item("A", "WRITING", { writingWeight: 100, readingWeight: 100 }),
    ]);
    expect(areWeightsValid(totals)).toBe(true);
  });

  it("rejects a template whose overall weight would be 0", () => {
    expect(areWeightsValid(computeSkillTotals([]))).toBe(false);
  });
});

describe("editing helpers", () => {
  it("keeps sequence contiguous after a removal", () => {
    const rows = removeItem(
      [item("A", "SPEAKING", {}, 1), item("B", "SPEAKING", {}, 2), item("C", "SPEAKING", {}, 3)],
      "B",
    );
    expect(rows.map((row) => [row.taskTypeKey, row.sequence])).toEqual([
      ["A", 1],
      ["C", 2],
    ]);
  });

  it("applies a suggested column only to the listed tasks", () => {
    const rows = applySuggestedColumn(
      [item("A", "READING", { readingWeight: 50 }), item("B", "READING", { readingWeight: 30 })],
      "READING",
      [{ taskTypeKey: "A", weight: 62.5 }],
    );
    expect(rows.map((row) => row.readingWeight)).toEqual([62.5, 30]);
  });

  it("formats weights without trailing zeros", () => {
    expect(formatWeight(100)).toBe("100");
    expect(formatWeight(62.5)).toBe("62.5");
    expect(formatWeight(33.33)).toBe("33.33");
  });
});
