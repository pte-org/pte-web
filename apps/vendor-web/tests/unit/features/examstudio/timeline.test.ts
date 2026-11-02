import { describe, expect, it } from "vitest";
import {
  blockSeconds,
  buildTimeline,
  distributeSpans,
  formatDuration,
  reorderKeys,
} from "../../../../features/examstudio/timeline";
import { templateItem } from "./fixtures";

describe("distributeSpans", () => {
  it("fills exactly the columns, in proportion to time", () => {
    expect(distributeSpans([300, 100], 12)).toEqual([9, 3]);
  });

  it("never gives a block less than one column", () => {
    const spans = distributeSpans([1000, 1, 1], 12);
    expect(spans.every((span) => span >= 1)).toBe(true);
    expect(spans.reduce((sum, span) => sum + span, 0)).toBe(12);
  });

  it("widens the lane when there are more blocks than columns", () => {
    expect(distributeSpans([1, 1, 1, 1], 2)).toEqual([1, 1, 1, 1]);
  });

  it("splits evenly when no block has any time", () => {
    expect(distributeSpans([0, 0], 4)).toEqual([2, 2]);
  });

  it("returns nothing for an empty lane", () => {
    expect(distributeSpans([], 12)).toEqual([]);
  });
});

describe("buildTimeline", () => {
  const items = [
    templateItem("READ_ALOUD", "SPEAKING", { sequence: 2, maxCount: 2, prepSeconds: 10, responseSeconds: 40 }),
    templateItem("REPEAT_SENTENCE", "SPEAKING", { sequence: 1, maxCount: 4, prepSeconds: 0, responseSeconds: 15 }),
    templateItem("WRITE_ESSAY", "WRITING", { sequence: 3, maxCount: 1, prepSeconds: 0, responseSeconds: 1200 }),
  ];

  it("times a task type as questions times preparation plus response", () => {
    expect(blockSeconds(items[0])).toBe(100);
  });

  it("makes one lane per skill, with blocks in template order", () => {
    const lanes = buildTimeline(items);
    expect(lanes.map((lane) => lane.section)).toEqual(["SPEAKING", "WRITING", "READING", "LISTENING"]);
    expect(lanes[0].blocks.map((block) => block.key)).toEqual(["REPEAT_SENTENCE", "READ_ALOUD"]);
    expect(lanes[2].blocks).toEqual([]);
  });

  it("makes the longest lane the widest", () => {
    const lanes = buildTimeline(items);
    const width = (index: number): number => lanes[index].blocks.reduce((sum, block) => sum + block.span, 0);
    expect(width(1)).toBe(12);
    expect(width(0)).toBeLessThan(width(1));
  });
});

describe("reorderKeys", () => {
  const keys = ["A", "B", "C", "D"];

  it("puts the moved key where the target is", () => {
    expect(reorderKeys(keys, "D", "B")).toEqual(["A", "D", "B", "C"]);
    expect(reorderKeys(keys, "A", "C")).toEqual(["B", "A", "C", "D"]);
  });

  it("changes nothing for an unknown key or a drop on itself", () => {
    expect(reorderKeys(keys, "A", "A")).toEqual(keys);
    expect(reorderKeys(keys, "Z", "A")).toEqual(keys);
  });
});

describe("formatDuration", () => {
  it("writes minutes and zero-padded seconds", () => {
    expect(formatDuration(525)).toBe("8:45");
    expect(formatDuration(1200)).toBe("20:00");
    expect(formatDuration(5)).toBe("0:05");
  });
});
