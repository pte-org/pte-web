import { describe, expect, it } from "vitest";
import type { QuestionGenerationPreset, QuestionGenerationQuotaResponse } from "@pte/api-client";
import {
  applyPreset,
  isPresetActive,
  rescalePresetRows,
  estimateSeconds,
  newRow,
  resolveSubmitMode,
  selectionTotal,
  toBatchRequest,
  toSingleJobRequest,
  updateRow,
  validateSelection,
  type GenerationSelection,
} from "../../../../features/questiongeneration/utils/generationSelection";

/** A small active template: 2 speaking types, 1 writing, 1 reading, 1 listening. */
const TEMPLATE: QuestionGenerationPreset[] = [
  { taskType: "READ_ALOUD", section: "SPEAKING", maxCount: 7 },
  { taskType: "REPEAT_SENTENCE", section: "SPEAKING", maxCount: 11 },
  { taskType: "WRITE_ESSAY", section: "WRITING", maxCount: 2 },
  { taskType: "MC_READING_SINGLE", section: "READING", maxCount: 2 },
  { taskType: "WRITE_FROM_DICTATION", section: "LISTENING", maxCount: 3 },
];
const SUPPORTED = new Set(TEMPLATE.map((preset) => preset.taskType));
const empty = (): GenerationSelection => ({
  pool: "PRACTICE",
  defaultCefr: "B2",
  sharedTopicText: "",
  rows: [],
});
const withRows = (...rows: GenerationSelection["rows"]): GenerationSelection => ({
  ...empty(),
  rows,
});
const limited = (
  patch: Partial<QuestionGenerationQuotaResponse> = {},
): QuestionGenerationQuotaResponse => ({
  usedToday: 0,
  dailyLimit: 100,
  remaining: 100,
  unlimited: false,
  scope: "USER",
  maxItemsPerBatch: 500,
  ...patch,
});
const UNLIMITED: QuestionGenerationQuotaResponse = {
  usedToday: 70,
  dailyLimit: 0,
  remaining: null,
  unlimited: true,
  scope: null,
  maxItemsPerBatch: 500,
};

describe("resolveSubmitMode (U1)", () => {
  it("keeps the in-form preview for one item of the editor's own task type", () => {
    expect(resolveSubmitMode(withRows(newRow("WRITE_ESSAY", "WRITING", "B2")), "WRITE_ESSAY")).toBe(
      "single",
    );
  });

  it("uses a batch for another type, two items or two types", () => {
    expect(resolveSubmitMode(withRows(newRow("READ_ALOUD", "SPEAKING", "B2")), "WRITE_ESSAY")).toBe(
      "batch",
    );
    expect(
      resolveSubmitMode(withRows(newRow("WRITE_ESSAY", "WRITING", "B2", 2)), "WRITE_ESSAY"),
    ).toBe("batch");
    expect(
      resolveSubmitMode(
        withRows(newRow("WRITE_ESSAY", "WRITING", "B2"), newRow("READ_ALOUD", "SPEAKING", "B2")),
        "WRITE_ESSAY",
      ),
    ).toBe("batch");
  });

  it("keeps the preview for one item when the form has no task type yet", () => {
    expect(resolveSubmitMode(withRows(newRow("READ_ALOUD", "SPEAKING", "B2")), undefined)).toBe(
      "single",
    );
  });
});

describe("presets", () => {
  it("Full 1 exam equals the active template exactly", () => {
    const result = applyPreset(empty(), TEMPLATE, "FULL", 1, 500, SUPPORTED);
    expect(result.ok && result.selection.rows.map((row) => [row.taskType, row.count])).toEqual(
      TEMPLATE.map((preset) => [preset.taskType, preset.maxCount]),
    );
  });

  it("scales every count by the number of exams and stays editable", () => {
    const result = applyPreset(empty(), TEMPLATE, "FULL", 3, 500, SUPPORTED);
    if (!result.ok) throw new Error("expected the preset to fit");
    expect(selectionTotal(result.selection)).toBe(25 * 3);
    expect(
      updateRow(result.selection, "WRITE_ESSAY", { count: 1 }).rows.find(
        (row) => row.taskType === "WRITE_ESSAY",
      )?.count,
    ).toBe(1);
  });

  it("a skill preset replaces only that skill's rows", () => {
    const start = withRows(newRow("WRITE_ESSAY", "WRITING", "B2", 9));
    const result = applyPreset(start, TEMPLATE, "SPEAKING", 1, 500, SUPPORTED);
    expect(result.ok && result.selection.rows.map((row) => [row.taskType, row.count])).toEqual([
      ["WRITE_ESSAY", 9],
      ["READ_ALOUD", 7],
      ["REPEAT_SENTENCE", 11],
    ]);
  });

  it("a second click on an applied skill preset unticks only that skill", () => {
    const full = applyPreset(empty(), TEMPLATE, "FULL", 1, 500, SUPPORTED);
    if (!full.ok) throw new Error("expected the preset to fit");
    expect(isPresetActive(full.selection, TEMPLATE, "SPEAKING", SUPPORTED)).toBe(true);
    const result = applyPreset(full.selection, TEMPLATE, "SPEAKING", 1, 500, SUPPORTED);
    expect(result.ok && result.selection.rows.some((row) => row.section === "SPEAKING")).toBe(
      false,
    );
    expect(result.ok && result.selection.rows.length).toBeGreaterThan(0);
  });

  it("a second click on an applied Full preset clears the selection", () => {
    const full = applyPreset(empty(), TEMPLATE, "FULL", 1, 500, SUPPORTED);
    if (!full.ok) throw new Error("expected the preset to fit");
    const result = applyPreset(full.selection, TEMPLATE, "FULL", 1, 500, SUPPORTED);
    expect(result.ok && result.selection.rows).toEqual([]);
    expect(isPresetActive(empty(), TEMPLATE, "FULL", SUPPORTED)).toBe(false);
  });

  it("changing the number of exams rescales untouched preset rows and keeps hand-edited ones", () => {
    const full = applyPreset(empty(), TEMPLATE, "FULL", 1, 500, SUPPORTED);
    if (!full.ok) throw new Error("expected the preset to fit");
    const edited = updateRow(full.selection, "WRITE_ESSAY", { count: 4 });
    const result = rescalePresetRows(edited, TEMPLATE, 1, 3, 500);
    if (!result.ok) throw new Error("expected the rescale to fit");
    expect(result.selection.rows.find((row) => row.taskType === "WRITE_ESSAY")?.count).toBe(4);
    expect(result.selection.rows.find((row) => row.taskType === "READ_ALOUD")?.count).toBe(7 * 3);
  });

  it("refuses a rescale above the batch cap", () => {
    const full = applyPreset(empty(), TEMPLATE, "FULL", 1, 500, SUPPORTED);
    if (!full.ok) throw new Error("expected the preset to fit");
    expect(rescalePresetRows(full.selection, TEMPLATE, 1, 10, 200)).toEqual({
      ok: false,
      reason: "OVER_CAP",
      total: 250,
    });
  });

  it("refuses a preset above the batch cap with its total, never clamping", () => {
    expect(applyPreset(empty(), TEMPLATE, "FULL", 10, 200, SUPPORTED)).toEqual({
      ok: false,
      reason: "OVER_CAP",
      total: 250,
    });
  });

  it("skips task types the generator does not support", () => {
    const result = applyPreset(empty(), TEMPLATE, "FULL", 1, 500, new Set(["READ_ALOUD"]));
    expect(result.ok && result.selection.rows.map((row) => row.taskType)).toEqual(["READ_ALOUD"]);
  });
});

describe("validateSelection", () => {
  it("checks the total against the server's batch cap", () => {
    expect(
      validateSelection(
        withRows(newRow("READ_ALOUD", "SPEAKING", "B2", 500)),
        limited({ remaining: 1000 }),
      ),
    ).toBeNull();
    expect(
      validateSelection(
        withRows(newRow("READ_ALOUD", "SPEAKING", "B2", 501)),
        limited({ remaining: 1000 }),
      ),
    ).toBe("OVER_CAP");
  });

  it("checks the server's remaining allowance, not dailyLimit - usedToday", () => {
    expect(
      validateSelection(
        withRows(newRow("READ_ALOUD", "SPEAKING", "B2", 6)),
        limited({ remaining: 5 }),
      ),
    ).toBe("OVER_QUOTA");
  });

  it("applies only the cap when unlimited", () => {
    expect(
      validateSelection(withRows(newRow("READ_ALOUD", "SPEAKING", "B2", 70)), UNLIMITED),
    ).toBeNull();
  });

  it("needs a ticked type, positive counts and valid topics", () => {
    expect(validateSelection(empty(), UNLIMITED)).toBe("EMPTY");
    expect(validateSelection(withRows(newRow("READ_ALOUD", "SPEAKING", "B2", 0)), UNLIMITED)).toBe(
      "COUNT",
    );
    expect(
      validateSelection(
        withRows({ ...newRow("READ_ALOUD", "SPEAKING", "B2"), topicText: "bad <tag>" }),
        UNLIMITED,
      ),
    ).toBe("TOPICS");
  });
});

describe("requests", () => {
  it("two types of 10 and 20 make one batch of two rows, 30 questions", () => {
    const selection = {
      ...withRows(
        newRow("READ_ALOUD", "SPEAKING", "B2", 10),
        newRow("DESCRIBE_IMAGE", "SPEAKING", "C1", 20),
      ),
      sharedTopicText: "climate",
    };
    const request = toBatchRequest(
      updateRow(selection, "DESCRIBE_IMAGE", { imageKind: "CHART", topicText: "cities" }),
    );
    expect(request).toEqual({
      pool: "PRACTICE",
      rows: [
        {
          taskType: "READ_ALOUD",
          cefrLevel: "B2",
          count: 10,
          topicHints: ["climate"],
          imageKind: null,
        },
        {
          taskType: "DESCRIBE_IMAGE",
          cefrLevel: "C1",
          count: 20,
          topicHints: ["cities"],
          imageKind: "CHART",
        },
      ],
    });
  });

  it("regression: the single preview job saves nothing", () => {
    expect(toSingleJobRequest(withRows(newRow("WRITE_ESSAY", "WRITING", "B2")))).toEqual({
      taskType: "WRITE_ESSAY",
      cefrLevel: "B2",
      pool: "PRACTICE",
      topicHint: null,
      count: 1,
      saveQuestions: false,
    });
  });

  it("estimates the sequential run from each type's seconds per item", () => {
    const selection = withRows(
      newRow("READ_ALOUD", "SPEAKING", "B2", 10),
      newRow("UNKNOWN", "SPEAKING", "B2", 1),
    );
    const types = [
      {
        taskType: "READ_ALOUD",
        section: "SPEAKING",
        needsAudio: false,
        needsImage: false,
        estimatedSecondsPerItem: 45,
      },
    ];
    expect(estimateSeconds(selection, types)).toBe(450 + 60);
  });
});
