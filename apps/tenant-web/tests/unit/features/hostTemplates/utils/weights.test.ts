import { describe, expect, it } from "vitest";
import type { ScoreTemplateItemRequest, ScoreTemplateItemResponse } from "@pte/api-client";
import {
  addBackItem,
  applySuggestedColumn,
  areWeightsValid,
  buildWeightEditableCheck,
  computeSkillTotals,
  findAddableItems,
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

  it("lists the task types of the default that the template no longer holds, in the default's order", () => {
    const base = [item("A", "SPEAKING", {}, 1), item("B", "WRITING", {}, 2), item("C", "READING", {}, 3)];
    const held = [item("B", "WRITING", {}, 1)];
    expect(findAddableItems(base, held).map((row) => row.taskTypeKey)).toEqual(["A", "C"]);
    expect(findAddableItems(base, base)).toEqual([]);
  });

  it("puts a task type back in the default's order with the default's values, keeping sequence contiguous", () => {
    const base = [
      item("A", "SPEAKING", { speakingWeight: 10 }, 1),
      item("B", "WRITING", { writingWeight: 20 }, 2),
      item("C", "READING", { readingWeight: 30 }, 3),
    ];
    const held = [item("A", "SPEAKING", { speakingWeight: 99 }, 1), item("C", "READING", {}, 2)];
    const rows = addBackItem(held, base, "B");
    expect(rows.map((row) => [row.taskTypeKey, row.sequence])).toEqual([
      ["A", 1],
      ["B", 2],
      ["C", 3],
    ]);
    expect(rows[1].writingWeight).toBe(20);
    // What the host changed on the others is left as it is.
    expect(rows[0].speakingWeight).toBe(99);
  });

  it("does not add a task type the default lacks, or one already held", () => {
    const base = [item("A", "SPEAKING", {}, 1)];
    const held = [item("A", "SPEAKING", {}, 1)];
    expect(addBackItem(held, base, "Z")).toEqual(held);
    expect(addBackItem(held, base, "A")).toEqual(held);
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
