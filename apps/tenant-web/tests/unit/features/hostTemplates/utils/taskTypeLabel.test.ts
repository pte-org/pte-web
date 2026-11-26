import { describe, expect, it } from "vitest";
import { taskTypeLabel } from "../../../../../features/hostTemplates/utils/taskTypeLabel";

describe("task type label in the template table", () => {
  it("turns a code into a readable name", () => {
    expect(taskTypeLabel("READ_ALOUD")).toBe("Read Aloud");
    expect(taskTypeLabel("SUMMARIZE_GROUP_DISCUSSION")).toBe("Summarize Group Discussion");
  });

  it("uses the catalogue spelling, hyphens and lower-case small words included", () => {
    expect(taskTypeLabel("RE_TELL_LECTURE")).toBe("Re-tell Lecture");
    expect(taskTypeLabel("RESPOND_TO_A_SITUATION")).toBe("Respond to a Situation");
    expect(taskTypeLabel("FILL_IN_THE_BLANKS_DROPDOWN")).toBe("Fill in the Blanks (Dropdown)");
  });

  it("spells out a code the catalogue does not list", () => {
    expect(taskTypeLabel("NEW_TASK_TYPE")).toBe("New Task Type");
  });
});
