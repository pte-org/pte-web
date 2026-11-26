import { describe, expect, it } from "vitest";
import {
  formatQuestionRange,
  formatSeconds,
  questionRange,
} from "../../../../../features/hostTemplates/utils/templateDisplay";

const units = { second: "sec", minute: "min" };

describe("formatSeconds", () => {
  it("shows a dash for no time and minutes for long limits", () => {
    expect(formatSeconds(0, units)).toBe("—");
    expect(formatSeconds(35, units)).toBe("35 sec");
    expect(formatSeconds(600, units)).toBe("10 min");
    expect(formatSeconds(1200, units)).toBe("20 min");
    expect(formatSeconds(90, units)).toBe("1 min 30 sec");
  });
});

describe("questionRange", () => {
  it("adds up the minimums and maximums of the rows", () => {
    const range = questionRange([
      { minCount: 6, maxCount: 7 },
      { minCount: 1, maxCount: 1 },
    ]);
    expect(range).toEqual({ min: 7, max: 8 });
    expect(formatQuestionRange(range)).toBe("7–8");
    expect(formatQuestionRange({ min: 3, max: 3 })).toBe("3");
    expect(formatQuestionRange(questionRange([]))).toBe("0");
  });
});
