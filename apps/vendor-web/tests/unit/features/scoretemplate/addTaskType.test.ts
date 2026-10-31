import { describe, expect, it } from "vitest";
import type { QuestionTypeResponse } from "@pte/api-client";
import {
  createDraftItem,
  findAvailableTaskTypes,
  getAddTaskTypeBlocker,
  taskTypeKeyOf,
} from "../../../../features/scoretemplate/addTaskType";
import type { ScoreTemplateItemDraft } from "../../../../features/scoretemplate/types";

// Only the fields these helpers read; the full catalog response has many more.
const catalogType = (
  code: string,
  section: string,
  overrides: Record<string, unknown> = {},
): QuestionTypeResponse =>
  ({ code, taskTypeKey: code, section, active: true, displayName: code, ...overrides }) as unknown as QuestionTypeResponse;

const usedItem = (taskTypeKey: string, section: string): ScoreTemplateItemDraft =>
  createDraftItem(catalogType(taskTypeKey, section), 1);

const READ_ALOUD = catalogType("READ_ALOUD", "SPEAKING");
const REPEAT_SENTENCE = catalogType("REPEAT_SENTENCE", "SPEAKING");
const WRITE_ESSAY = catalogType("WRITE_ESSAY", "WRITING");
const CATALOG = [READ_ALOUD, REPEAT_SENTENCE, WRITE_ESSAY];

const keys = (types: QuestionTypeResponse[]): string[] => types.map(taskTypeKeyOf);

describe("taskTypeKeyOf", () => {
  it("prefers the task type key and falls back to the code", () => {
    expect(taskTypeKeyOf(catalogType("A", "SPEAKING", { taskTypeKey: "A_KEY" }))).toBe("A_KEY");
    expect(taskTypeKeyOf(catalogType("A", "SPEAKING", { taskTypeKey: undefined }))).toBe("A");
  });
});

describe("findAvailableTaskTypes", () => {
  it("lists the section's task types that the template does not use yet", () => {
    const items = [usedItem("READ_ALOUD", "SPEAKING")];
    expect(keys(findAvailableTaskTypes(CATALOG, items, "SPEAKING"))).toEqual(["REPEAT_SENTENCE"]);
  });

  it("only offers the requested section", () => {
    expect(keys(findAvailableTaskTypes(CATALOG, [], "WRITING"))).toEqual(["WRITE_ESSAY"]);
  });

  it("skips inactive task types and ones whose runtime is not ready", () => {
    const catalog = [
      catalogType("INACTIVE", "SPEAKING", { active: false }),
      catalogType("NOT_READY", "SPEAKING", { readiness: { ready: false } }),
      READ_ALOUD,
    ];
    expect(keys(findAvailableTaskTypes(catalog, [], "SPEAKING"))).toEqual(["READ_ALOUD"]);
  });

  it("offers nothing before a section is chosen", () => {
    expect(findAvailableTaskTypes(CATALOG, [], "")).toEqual([]);
  });
});

describe("getAddTaskTypeBlocker", () => {
  it("is null while a section is not chosen or something can still be added", () => {
    expect(getAddTaskTypeBlocker(CATALOG, [], "")).toBeNull();
    expect(getAddTaskTypeBlocker(CATALOG, [], "SPEAKING")).toBeNull();
  });

  it("reports a section with no active task types", () => {
    expect(getAddTaskTypeBlocker(CATALOG, [], "READING")).toBe("NO_ACTIVE_TASK_TYPES");
    expect(getAddTaskTypeBlocker([], [], "SPEAKING")).toBe("NO_ACTIVE_TASK_TYPES");
  });

  it("reports a section whose active task types are all already in the template", () => {
    const items = [usedItem("READ_ALOUD", "SPEAKING"), usedItem("REPEAT_SENTENCE", "SPEAKING")];
    expect(getAddTaskTypeBlocker(CATALOG, items, "SPEAKING")).toBe("ALL_ACTIVE_TYPES_USED");
  });

  it("reports unused task types that the app runtime cannot run", () => {
    const catalog = [catalogType("NOT_READY", "SPEAKING", { readiness: { ready: false } })];
    expect(getAddTaskTypeBlocker(catalog, [], "SPEAKING")).toBe("INCOMPATIBLE_RUNTIME_PROFILE");
  });
});

describe("createDraftItem", () => {
  it("starts a row with one question, no timing and zero weights at the given sequence", () => {
    expect(createDraftItem(READ_ALOUD, 4)).toEqual({
      taskType: "READ_ALOUD",
      taskTypeKey: "READ_ALOUD",
      section: "SPEAKING",
      sequence: 4,
      minCount: "1",
      maxCount: "1",
      prepSeconds: "0",
      responseSeconds: "0",
      overallWeight: "0",
      speakingWeight: "0",
      writingWeight: "0",
      readingWeight: "0",
      listeningWeight: "0",
    });
  });
});
