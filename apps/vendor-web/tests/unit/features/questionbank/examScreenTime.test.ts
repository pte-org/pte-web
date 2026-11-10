import { describe, expect, it } from "vitest";
import { formatClock } from "../../../../features/questionbank/examScreenTime";

describe("formatClock", () => {
  it("shows whole seconds as mm:ss", () => {
    expect(formatClock(0)).toBe("00:00");
    expect(formatClock(5)).toBe("00:05");
    expect(formatClock(65)).toBe("01:05");
    expect(formatClock(40.9)).toBe("00:40");
  });

  it("treats negative and non-finite values as zero", () => {
    expect(formatClock(-3)).toBe("00:00");
    expect(formatClock(Number.NaN)).toBe("00:00");
    expect(formatClock(Number.POSITIVE_INFINITY)).toBe("00:00");
  });
});
