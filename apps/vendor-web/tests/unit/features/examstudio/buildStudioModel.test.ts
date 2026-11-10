import { describe, expect, it } from "vitest";
import type { ScoreTemplateFeasibilityResponse } from "@pte/api-client";
import { buildStudioModel } from "../../../../features/examstudio/buildStudioModel";
import { taskType, template, templateItem } from "./fixtures";

const feasibility = (slots: Record<string, number>): ScoreTemplateFeasibilityResponse => ({
  examDefinitionPublicId: "template-1",
  examDefinitionVersion: 1,
  ready: false,
  slots: Object.entries(slots).map(([key, available]) => ({
    taskType: key,
    section: "SPEAKING",
    required: 4,
    available,
    ready: available >= 4,
    reason: null,
  })),
});

const TYPES = [
  taskType("READ_ALOUD", "SPEAKING", 2),
  taskType("REPEAT_SENTENCE", "SPEAKING", 1),
  taskType("WRITE_ESSAY", "WRITING", 1),
  taskType("OLD_TYPE", "READING", 1, false),
];

describe("buildStudioModel", () => {
  const working = template("DRAFT", 3, [
    templateItem("READ_ALOUD", "SPEAKING"),
    templateItem("REPEAT_SENTENCE", "SPEAKING"),
  ]);

  it("lists active task types only, by section then display order", () => {
    const model = buildStudioModel(working, TYPES, feasibility({}));
    expect(model.tiles.map((tile) => tile.key)).toEqual(["REPEAT_SENTENCE", "READ_ALOUD", "WRITE_ESSAY"]);
  });

  it("classifies each task type by how many of the needed questions exist", () => {
    const model = buildStudioModel(working, TYPES, feasibility({ READ_ALOUD: 4, REPEAT_SENTENCE: 2 }));
    const state = (key: string) => model.tiles.find((tile) => tile.key === key)?.state;
    expect(state("READ_ALOUD")).toBe("ready");
    expect(state("REPEAT_SENTENCE")).toBe("short");
    expect(state("WRITE_ESSAY")).toBe("outside");
  });

  it("calls a task type missing when fewer than half of the needed questions exist", () => {
    const model = buildStudioModel(working, TYPES, feasibility({ READ_ALOUD: 1 }));
    expect(model.tiles.find((tile) => tile.key === "READ_ALOUD")?.state).toBe("missing");
  });

  it("counts the questions still missing and the task types outside the template", () => {
    const model = buildStudioModel(working, TYPES, feasibility({ READ_ALOUD: 4, REPEAT_SENTENCE: 2 }));
    expect(model.missingQuestions).toBe(2);
    expect(model.outsideCount).toBe(1);
    expect(model.readyCount).toBe(1);
    expect(model.totalCount).toBe(3);
    expect(model.isReady).toBe(false);
  });

  it("is ready only when every task type is in the template with enough questions", () => {
    const full = template("DRAFT", 3, [
      templateItem("READ_ALOUD", "SPEAKING"),
      templateItem("REPEAT_SENTENCE", "SPEAKING"),
      templateItem("WRITE_ESSAY", "WRITING"),
    ]);
    const model = buildStudioModel(full, TYPES, feasibility({ READ_ALOUD: 4, REPEAT_SENTENCE: 9, WRITE_ESSAY: 4 }));
    expect(model.isReady).toBe(true);
  });

  it("treats every task type as outside when there is no template", () => {
    const model = buildStudioModel(undefined, TYPES, undefined);
    expect(model.tiles.every((tile) => tile.state === "outside")).toBe(true);
    expect(model.isReady).toBe(false);
  });

  it("estimates how many exams the approved questions fill without a repeated question", () => {
    const model = buildStudioModel(working, TYPES, feasibility({ READ_ALOUD: 9, REPEAT_SENTENCE: 3 }));
    const exams = (key: string) => model.tiles.find((tile) => tile.key === key)?.distinctExams;
    expect(exams("READ_ALOUD")).toBe(2);
    expect(exams("REPEAT_SENTENCE")).toBe(0);
    expect(exams("WRITE_ESSAY")).toBeNull();
  });
});
