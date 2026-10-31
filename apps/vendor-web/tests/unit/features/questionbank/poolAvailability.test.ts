import { describe, expect, it } from "vitest";
import {
  poolToAvailability,
  resolveCurrentPool,
} from "../../../../features/questionbank/poolAvailability";

describe("question pool availability", () => {
  it("follows an exclusive availability flag over the creation pool", () => {
    expect(
      resolveCurrentPool({ pool: "EXAM", availableForExam: false, availableForPractice: true }),
    ).toBe("PRACTICE");
    expect(
      resolveCurrentPool({ pool: "PRACTICE", availableForExam: true, availableForPractice: false }),
    ).toBe("EXAM");
  });

  it("falls back to the creation pool when flags are missing or both set", () => {
    expect(resolveCurrentPool({ pool: "PRACTICE" })).toBe("PRACTICE");
    expect(resolveCurrentPool({ pool: "EXAM" })).toBe("EXAM");
    expect(
      resolveCurrentPool({ pool: "PRACTICE", availableForExam: true, availableForPractice: true }),
    ).toBe("PRACTICE");
  });

  it("builds mutually exclusive availability flags for the target pool", () => {
    expect(poolToAvailability("PRACTICE")).toEqual({
      availableForExam: false,
      availableForPractice: true,
    });
    expect(poolToAvailability("EXAM")).toEqual({
      availableForExam: true,
      availableForPractice: false,
    });
  });
});
