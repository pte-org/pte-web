import { describe, expect, it } from "vitest";
import {
  buildReplacePayload,
  draftsOf,
  withMaxCount,
  withoutTaskType,
  withSeconds,
  withTaskType,
} from "../../../../features/examstudio/editTemplateItems";
import { taskType, template, templateItem } from "./fixtures";

const working = template("DRAFT", 3, [
  templateItem("READ_ALOUD", "SPEAKING", { sequence: 1, speakingWeight: 12 }),
  templateItem("REPEAT_SENTENCE", "SPEAKING", { sequence: 2 }),
]);

describe("editTemplateItems", () => {
  it("sets the question count and keeps the minimum at or below it", () => {
    const result = withMaxCount(draftsOf(working), "READ_ALOUD", 1);
    const edited = result.find((item) => item.taskTypeKey === "READ_ALOUD");
    expect(edited?.maxCount).toBe("1");
    expect(edited?.minCount).toBe("1");
    expect(result.find((item) => item.taskTypeKey === "REPEAT_SENTENCE")?.maxCount).toBe("4");
  });

  it("never lets the count leave 1 to the limit", () => {
    expect(withMaxCount(draftsOf(working), "READ_ALOUD", 0)[0].maxCount).toBe("1");
    expect(withMaxCount(draftsOf(working), "READ_ALOUD", 99)[0].maxCount).toBe("20");
  });

  it("changes only the chosen time of the chosen task type", () => {
    const result = withSeconds(draftsOf(working), "REPEAT_SENTENCE", "prepSeconds", 25);
    expect(result[1].prepSeconds).toBe("25");
    expect(result[1].responseSeconds).toBe("40");
    expect(result[0].prepSeconds).toBe("10");
  });

  it("adds a task type with no weight at the end of the list", () => {
    const result = withTaskType(draftsOf(working), taskType("WRITE_ESSAY", "WRITING", 1));
    expect(result).toHaveLength(3);
    expect(result[2]).toMatchObject({ taskTypeKey: "WRITE_ESSAY", sequence: 3, speakingWeight: "0" });
  });

  it("removes a task type and renumbers the rest", () => {
    const result = withoutTaskType(draftsOf(working), "READ_ALOUD");
    expect(result.map((item) => [item.taskTypeKey, item.sequence])).toEqual([["REPEAT_SENTENCE", 1]]);
  });

  it("builds a standard-policy payload from the edited rows", () => {
    const payload = buildReplacePayload(working, draftsOf(working));
    expect(payload).toMatchObject({ name: "PTE template", templatePolicy: "STANDARD_PTE" });
    expect(payload.items).toHaveLength(2);
  });
});
