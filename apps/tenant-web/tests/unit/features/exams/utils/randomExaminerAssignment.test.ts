import { describe, expect, it } from "vitest";
import { randomExaminerAssignment } from "../../../../../features/exams/utils/randomExaminerAssignment";

describe("randomExaminerAssignment", () => {
  const attempts = Array.from({ length: 7 }, (_, index) => `attempt-${index}`);

  it("assigns every attempt and balances load within one attempt", () => {
    const result = randomExaminerAssignment(attempts, ["a", "b", "c"]);

    expect(Object.keys(result).sort()).toEqual([...attempts].sort());
    const loads = ["a", "b", "c"].map(
      (examiner) => Object.values(result).filter((id) => id === examiner).length,
    );
    expect(Math.max(...loads) - Math.min(...loads)).toBeLessThanOrEqual(1);
    expect(loads.reduce((sum, load) => sum + load, 0)).toBe(7);
  });

  it("is reproducible for a fixed random source and does not mutate its input", () => {
    const input = [...attempts];
    const first = randomExaminerAssignment(input, ["a", "b"], () => 0);
    const second = randomExaminerAssignment(input, ["a", "b"], () => 0);

    expect(first).toEqual(second);
    expect(input).toEqual(attempts);
  });

  it("returns nothing when no examiner is chosen", () => {
    expect(randomExaminerAssignment(attempts, [])).toEqual({});
  });
});
