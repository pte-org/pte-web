import { describe, expect, it } from "vitest";
import type { ScoreTemplateItemRequest } from "@pte/api-client";
import {
  findInvalidCounts,
  parseCount,
  setCount,
} from "@/features/hostTemplates/utils/counts";

const item = (taskTypeKey: string, minCount: number, maxCount: number): ScoreTemplateItemRequest =>
  ({ taskTypeKey, section: "SPEAKING", sequence: 1, minCount, maxCount }) as ScoreTemplateItemRequest;

describe("parseCount", () => {
  it("keeps whole positive numbers and floors decimals", () => {
    expect(parseCount("4")).toBe(4);
    expect(parseCount("3.7")).toBe(3);
  });

  it("falls back to 1 for blank, zero, negative or junk input", () => {
    expect(parseCount("")).toBe(1);
    expect(parseCount("0")).toBe(1);
    expect(parseCount("-2")).toBe(1);
    expect(parseCount("abc")).toBe(1);
  });
});

describe("setCount", () => {
  it("changes only the targeted field of the targeted row without mutating the input", () => {
    const items = [item("RA", 6, 7), item("RS", 10, 12)];
    const next = setCount(items, "RS", "maxCount", 15);
    expect(next[1]).toMatchObject({ minCount: 10, maxCount: 15 });
    expect(next[0]).toBe(items[0]);
    expect(items[1].maxCount).toBe(12);
  });
});

describe("findInvalidCounts", () => {
  it("lists task types whose minimum exceeds the maximum or that ask no question", () => {
    const items = [item("RA", 6, 7), item("RS", 9, 8), item("DI", 0, 0), item("WFD", 3, 3)];
    expect(findInvalidCounts(items)).toEqual(["RS", "DI"]);
  });

  it("returns nothing for valid ranges", () => {
    expect(findInvalidCounts([item("RA", 1, 1), item("RS", 2, 5)])).toEqual([]);
  });
});
