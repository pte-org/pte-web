import { describe, expect, it } from "vitest";
import {
  cellValue,
  fillEachTaskType,
  isFillEachActive,
  levelTotals,
  sectionTotals,
  setCell,
} from "../../../../features/questiongeneration/utils/generationMatrix";
import {
  newRow,
  type GenerationSelection,
} from "../../../../features/questiongeneration/utils/generationSelection";

const selection = (...rows: GenerationSelection["rows"]): GenerationSelection => ({
  pool: "PRACTICE",
  defaultCefr: "B2",
  sharedTopicText: "",
  rows,
});
const READ_ALOUD = { taskType: "READ_ALOUD", section: "SPEAKING" };
const WRITE_ESSAY = { taskType: "WRITE_ESSAY", section: "WRITING" };

describe("generation matrix", () => {
  it("reads a single-level row only on its own level", () => {
    const row = newRow("READ_ALOUD", "SPEAKING", "B2", 4);
    expect(cellValue(row, "B2")).toBe(4);
    expect(cellValue(row, "C1")).toBe(0);
    expect(cellValue(undefined, "B2")).toBe(0);
  });

  it("adds a row on the first cell and splits it on the next", () => {
    const one = setCell(selection(), READ_ALOUD, "B1", 2);
    const two = setCell(one, READ_ALOUD, "C1", 3);
    expect(two.rows).toHaveLength(1);
    expect(cellValue(two.rows[0], "B1")).toBe(2);
    expect(cellValue(two.rows[0], "C1")).toBe(3);
  });

  it("removes a row once every cell is empty, and ignores invalid values", () => {
    const one = setCell(selection(), READ_ALOUD, "B1", 2);
    expect(setCell(one, READ_ALOUD, "B1", 0).rows).toEqual([]);
    expect(setCell(one, READ_ALOUD, "B1", Number.NaN).rows).toEqual([]);
  });

  it("fills each type at the default level and keeps own topics", () => {
    const kept = { ...newRow("READ_ALOUD", "SPEAKING", "A1", 9), topicText: "travel" };
    const result = fillEachTaskType(selection(kept), [READ_ALOUD, WRITE_ESSAY], 2, 100);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.selection.rows.map((row) => [row.taskType, row.cefrLevel, row.count])).toEqual([
      ["READ_ALOUD", "B2", 2],
      ["WRITE_ESSAY", "B2", 2],
    ]);
    expect(result.selection.rows[0]?.topicText).toBe("travel");
  });

  it("marks the shortcut active only while every type has exactly N questions", () => {
    const result = fillEachTaskType(selection(), [READ_ALOUD, WRITE_ESSAY], 3, 100);
    if (!result.ok) throw new Error("expected a fill");
    expect(isFillEachActive(result.selection, [READ_ALOUD, WRITE_ESSAY], 3)).toBe(true);
    expect(isFillEachActive(result.selection, [READ_ALOUD, WRITE_ESSAY], 2)).toBe(false);
    expect(
      isFillEachActive(
        setCell(result.selection, READ_ALOUD, "C1", 1),
        [READ_ALOUD, WRITE_ESSAY],
        3,
      ),
    ).toBe(false);
    expect(isFillEachActive(selection(), [], 3)).toBe(false);
  });

  it("refuses to fill above the batch cap", () => {
    expect(fillEachTaskType(selection(), [READ_ALOUD, WRITE_ESSAY], 2, 3)).toEqual({
      ok: false,
      reason: "OVER_CAP",
      total: 4,
    });
  });

  it("totals per level and per skill", () => {
    const sel = setCell(
      setCell(selection(newRow("WRITE_ESSAY", "WRITING", "B2", 1)), READ_ALOUD, "B2", 2),
      READ_ALOUD,
      "C1",
      1,
    );
    expect(levelTotals(sel)).toMatchObject({ B2: 3, C1: 1, A1: 0 });
    expect(sectionTotals(sel)).toMatchObject({ SPEAKING: 3, WRITING: 1 });
  });
});
