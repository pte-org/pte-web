import { describe, expect, it } from "vitest";
import {
  applyVisibleOrder,
  reorderSectionItems,
} from "../../../../features/scoretemplate/reorderSectionItems";
import type { ScoreTemplateItemDraft } from "../../../../features/scoretemplate/types";

const draft = (taskTypeKey: string, section: string, sequence: number): ScoreTemplateItemDraft => ({
  taskType: taskTypeKey,
  taskTypeKey,
  section,
  sequence,
  minCount: "1",
  maxCount: "1",
  prepSeconds: "0",
  responseSeconds: "0",
  overallWeight: "0",
  speakingWeight: "0",
  writingWeight: "0",
  readingWeight: "0",
  listeningWeight: "0",
});

// Speaking and Writing interleaved on purpose: the slots of the other section must not move.
const ITEMS = [
  draft("S1", "SPEAKING", 1),
  draft("W1", "WRITING", 2),
  draft("S2", "SPEAKING", 3),
  draft("W2", "WRITING", 4),
  draft("S3", "SPEAKING", 5),
];

const keys = (items: ScoreTemplateItemDraft[]): string[] => items.map((item) => item.taskTypeKey);

describe("reorderSectionItems", () => {
  it("reorders only the given section and leaves other sections in their slots", () => {
    const result = reorderSectionItems(ITEMS, "SPEAKING", ["S3", "S1", "S2"]);
    expect(keys(result)).toEqual(["S3", "W1", "S1", "W2", "S2"]);
  });

  it("renumbers sequence 1..n in the new order", () => {
    const result = reorderSectionItems(ITEMS, "SPEAKING", ["S3", "S1", "S2"]);
    expect(result.map((item) => item.sequence)).toEqual([1, 2, 3, 4, 5]);
  });

  it("returns an equal list when the order did not change", () => {
    expect(reorderSectionItems(ITEMS, "WRITING", ["W1", "W2"])).toEqual(ITEMS);
  });

  it("does not mutate the input", () => {
    const snapshot = structuredClone(ITEMS);
    reorderSectionItems(ITEMS, "SPEAKING", ["S3", "S2", "S1"]);
    expect(ITEMS).toEqual(snapshot);
  });

  it("keeps every other field of the moved rows", () => {
    const withWeight = [{ ...draft("S1", "SPEAKING", 1), speakingWeight: "12.5" }, draft("S2", "SPEAKING", 2)];
    const result = reorderSectionItems(withWeight, "SPEAKING", ["S2", "S1"]);
    expect(result[1]).toMatchObject({ taskTypeKey: "S1", speakingWeight: "12.5", sequence: 2 });
  });

  it("ignores a stale order that is missing a task type", () => {
    expect(reorderSectionItems(ITEMS, "SPEAKING", ["S1", "S2"])).toBe(ITEMS);
  });

  it("ignores a stale order with an unknown task type", () => {
    expect(reorderSectionItems(ITEMS, "SPEAKING", ["S1", "S2", "X"])).toBe(ITEMS);
  });

  it("ignores an order that repeats a task type instead of duplicating a row", () => {
    expect(reorderSectionItems(ITEMS, "SPEAKING", ["S1", "S1", "S2"])).toBe(ITEMS);
  });

  it("ignores an order for a section that has no items", () => {
    expect(reorderSectionItems(ITEMS, "READING", ["S1"])).toBe(ITEMS);
  });
});

describe("applyVisibleOrder", () => {
  it("reorders one section when only that section's rows are shown", () => {
    const result = applyVisibleOrder(ITEMS, ["S3", "S1", "S2"]);
    expect(keys(result)).toEqual(["S3", "W1", "S1", "W2", "S2"]);
    expect(result.map((item) => item.sequence)).toEqual([1, 2, 3, 4, 5]);
  });

  it("moves a row only within its own section when it is dropped among another section's rows", () => {
    // S1 was dragged below W1 in the all-sections table: the visible order is W1 S1 S2 W2 S3.
    const result = applyVisibleOrder(ITEMS, ["W1", "S1", "S2", "W2", "S3"]);
    expect(keys(result)).toEqual(["S1", "W1", "S2", "W2", "S3"]);
  });

  it("applies the relative order of every section at once", () => {
    const result = applyVisibleOrder(ITEMS, ["W2", "S2", "S1", "W1", "S3"]);
    expect(keys(result)).toEqual(["S2", "W2", "S1", "W1", "S3"]);
  });

  it("leaves a section alone when only some of its rows are in the order", () => {
    expect(keys(applyVisibleOrder(ITEMS, ["S3", "S1"]))).toEqual(keys(ITEMS));
  });

  it("ignores an order made only of unknown rows", () => {
    expect(applyVisibleOrder(ITEMS, ["X", "Y"])).toBe(ITEMS);
  });
});
