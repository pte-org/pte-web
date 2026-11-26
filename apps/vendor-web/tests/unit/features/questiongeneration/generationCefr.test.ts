import { describe, expect, it } from "vitest";
import type { QuestionGenerationPreset, QuestionGenerationQuotaResponse } from "@pte/api-client";
import {
  expandLevels,
  rowTotal,
  setLevelCount,
  splitRow,
} from "../../../../features/questiongeneration/utils/generationCefr";
import {
  applyPreset,
  isPresetActive,
  newRow,
  rescalePresetRows,
  resolveSubmitMode,
  selectionTotal,
  toBatchRequest,
  toSingleJobRequest,
  validateSelection,
  type GenerationSelection,
} from "../../../../features/questiongeneration/utils/generationSelection";

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
const QUOTA: QuestionGenerationQuotaResponse = {
  usedToday: 0,
  dailyLimit: 100,
  remaining: 100,
  unlimited: false,
  scope: "USER",
  maxItemsPerBatch: 500,
};
const split = (count: number, levels: Partial<Record<"A1" | "B1" | "C1", number>>) => {
  let row = splitRow(newRow("REPEAT_SENTENCE", "SPEAKING", "B2", count));
  row = setLevelCount(row, "B2", 0);
  for (const [level, value] of Object.entries(levels))
    row = setLevelCount(row, level as "A1" | "B1" | "C1", value);
  return row;
};

describe("split rows (mixed levels)", () => {
  it("moves the count onto the row's level when split", () => {
    const row = splitRow(newRow("REPEAT_SENTENCE", "SPEAKING", "C1", 4));
    expect(row.levels).toEqual({ A1: 0, A2: 0, B1: 0, B2: 0, C1: 4, C2: 0 });
    expect(rowTotal(row)).toBe(4);
  });

  it("keeps count as the sum of the levels", () => {
    const row = split(0, { A1: 2, C1: 3 });
    expect(row.count).toBe(5);
    expect(rowTotal(row)).toBe(5);
  });

  it("expands into one batch row per level with questions, sharing topics and image kind", () => {
    const selection = {
      ...withRows(split(0, { A1: 2, C1: 3 }), newRow("WRITE_ESSAY", "WRITING", "B1", 1)),
      sharedTopicText: "food",
    };
    expect(toBatchRequest(selection).rows).toEqual([
      {
        taskType: "REPEAT_SENTENCE",
        cefrLevel: "A1",
        count: 2,
        topicHints: ["food"],
        imageKind: null,
      },
      {
        taskType: "REPEAT_SENTENCE",
        cefrLevel: "C1",
        count: 3,
        topicHints: ["food"],
        imageKind: null,
      },
      { taskType: "WRITE_ESSAY", cefrLevel: "B1", count: 1, topicHints: ["food"], imageKind: null },
    ]);
    expect(expandLevels(newRow("WRITE_ESSAY", "WRITING", "B1", 2))).toEqual([
      { cefrLevel: "B1", count: 2 },
    ]);
  });

  it("counts split totals and refuses a split row with no question", () => {
    expect(
      selectionTotal(
        withRows(split(0, { A1: 2, C1: 3 }), newRow("WRITE_ESSAY", "WRITING", "B1", 1)),
      ),
    ).toBe(6);
    expect(validateSelection(withRows(split(0, {})), QUOTA)).toBe("SPLIT_EMPTY");
    expect(validateSelection(withRows(split(0, { A1: 1 })), QUOTA)).toBeNull();
  });

  it("keeps the single preview for one question at one level, and sends that level", () => {
    const one = withRows(split(0, { A1: 1 }));
    expect(resolveSubmitMode(one, "REPEAT_SENTENCE")).toBe("single");
    expect(toSingleJobRequest(one).cefrLevel).toBe("A1");
    expect(resolveSubmitMode(withRows(split(0, { A1: 1, C1: 1 })), "REPEAT_SENTENCE")).toBe(
      "batch",
    );
  });
});

describe("presets and split rows", () => {
  const TEMPLATE: QuestionGenerationPreset[] = [
    { taskType: "READ_ALOUD", section: "SPEAKING", maxCount: 2 },
    { taskType: "REPEAT_SENTENCE", section: "SPEAKING", maxCount: 3 },
  ];
  const SUPPORTED = new Set(TEMPLATE.map((preset) => preset.taskType));

  it("applying a preset sets plain rows without levels", () => {
    const result = applyPreset(withRows(split(0, { A1: 3 })), TEMPLATE, "FULL", 1, 500, SUPPORTED);
    expect(result.ok && result.selection.rows.every((row) => row.levels === undefined)).toBe(true);
    expect(isPresetActive(withRows(split(0, { A1: 3 })), TEMPLATE, "SPEAKING", SUPPORTED)).toBe(
      false,
    );
  });

  it("rescale skips split rows", () => {
    const start = withRows(newRow("READ_ALOUD", "SPEAKING", "B2", 2), split(0, { A1: 3 }));
    const result = rescalePresetRows(start, TEMPLATE, 1, 2, 500);
    expect(result.ok && result.selection.rows.map((row) => row.count)).toEqual([4, 3]);
  });
});
