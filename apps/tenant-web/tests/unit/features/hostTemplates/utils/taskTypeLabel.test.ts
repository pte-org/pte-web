import { describe, expect, it } from "vitest";
import { taskTypeLabel } from "../../../../../features/hostTemplates/utils/taskTypeLabel";

describe("task type label in the template table", () => {
  it("turns a code into a readable name", () => {
    expect(taskTypeLabel("READ_ALOUD")).toBe("Read Aloud");
    expect(taskTypeLabel("SUMMARIZE_GROUP_DISCUSSION")).toBe("Summarize Group Discussion");
  });
});
