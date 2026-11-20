import { describe, expect, it } from "vitest";
import { jobLabel } from "../../../../features/batchgeneration/utils/jobLabel";

describe("jobLabel", () => {
  it("adds the CEFR level after the task type when known", () => {
    expect(jobLabel("REPEAT_SENTENCE", "C1")).toMatch(/ · C1$/);
    expect(jobLabel("REPEAT_SENTENCE", undefined)).not.toContain("·");
  });
});
