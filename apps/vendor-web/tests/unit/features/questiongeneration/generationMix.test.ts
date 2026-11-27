import { describe, expect, it } from "vitest";
import {
  levelSequence,
  mixShares,
  singleLevelRows,
  spreadRows,
  type CefrShare,
} from "../../../../features/questiongeneration/utils/generationMix";
import { rowTotal } from "../../../../features/questiongeneration/utils/generationCefr";
import {
  applyPreset,
  newRow,
  rescalePresetRows,
  type GenerationSelection,
} from "../../../../features/questiongeneration/utils/generationSelection";

const EVEN: CefrShare[] = [
  { level: "B1", percent: 25 },
  { level: "B2", percent: 25 },
  { level: "C1", percent: 25 },
  { level: "C2", percent: 25 },
];
const count = (levels: string[], level: string): number => levels.filter((l) => l === level).length;
const totals = (rows: readonly ReturnType<typeof spreadRows>[number][]): Record<string, number> => {
  const sum: Record<string, number> = {};
  rows.forEach((row) => Object.entries(row.levels ?? {}).forEach(([l, n]) => (sum[l] = (sum[l] ?? 0) + n)));
  return sum;
};

describe("mixShares", () => {
  it("keeps known levels with a share and drops the rest", () => {
    expect(
      mixShares({
        templateName: "T",
        templateVersion: 1,
        targets: [
          { level: "B1", percent: 50 },
          { level: "A2", percent: 0 },
          { level: "X9", percent: 50 },
        ],
      }),
    ).toEqual([{ level: "B1", percent: 50 }]);
    expect(mixShares(null)).toEqual([]);
  });
});

describe("levelSequence", () => {
  it("gives every level its share of the exam within one question", () => {
    const sequence = levelSequence(EVEN, 85);
    expect(sequence).toHaveLength(85);
    EVEN.forEach(({ level }) => expect(Math.abs(count(sequence, level) - 85 / 4)).toBeLessThan(1));
  });

  it("follows an uneven mix", () => {
    const sequence = levelSequence(
      [
        { level: "B1", percent: 20 },
        { level: "B2", percent: 80 },
      ],
      10,
    );
    expect(count(sequence, "B1")).toBe(2);
    expect(count(sequence, "B2")).toBe(8);
  });
});

describe("spreadRows", () => {
  it("spreads the exam over the mix and gives a row of several questions several levels", () => {
    const rows = spreadRows(
      [newRow("READ_ALOUD", "SPEAKING", "B2", 6), newRow("WRITE_ESSAY", "WRITING", "B2", 2), newRow("ASQ", "SPEAKING", "B2", 1)],
      EVEN,
    );
    expect(rows.map(rowTotal)).toEqual([6, 2, 1]);
    const sum = totals(rows);
    EVEN.forEach(({ level }) => expect(Math.abs((sum[level] ?? 0) - 9 / 4)).toBeLessThan(1));
    expect(Object.values(rows[1].levels ?? {}).filter((n) => n > 0)).toHaveLength(2);
  });

  it("leaves the rows alone without a mix", () => {
    const row = newRow("READ_ALOUD", "SPEAKING", "B2", 3);
    expect(spreadRows([row], [])).toEqual([row]);
  });

  it("goes back to one level keeping each total", () => {
    const [row] = singleLevelRows(spreadRows([newRow("READ_ALOUD", "SPEAKING", "B2", 5)], EVEN), "C1");
    expect(row.levels).toBeUndefined();
    expect(row.count).toBe(5);
    expect(row.cefrLevel).toBe("C1");
  });
});

describe("full-exam preset with a mix", () => {
  const presets = [
    { taskType: "READ_ALOUD", section: "SPEAKING", maxCount: 6 },
    { taskType: "WRITE_ESSAY", section: "WRITING", maxCount: 2 },
  ];
  const supported = new Set(presets.map((p) => p.taskType));
  const empty: GenerationSelection = { pool: "EXAM", defaultCefr: "B2", sharedTopicText: "", rows: [] };

  it("spreads the full exam and marks it; a skill preset keeps one level", () => {
    const full = applyPreset(empty, presets, "FULL", 1, 500, supported, EVEN);
    if (!full.ok) throw new Error("refused");
    expect(full.selection.spreadByMix).toBe(true);
    expect(full.selection.rows.every((row) => row.levels !== undefined)).toBe(true);

    const skill = applyPreset(empty, presets, "SPEAKING", 1, 500, supported, EVEN);
    if (!skill.ok) throw new Error("refused");
    expect(skill.selection.rows[0].levels).toBeUndefined();
  });

  it("keeps one level when the template has no mix", () => {
    const full = applyPreset(empty, presets, "FULL", 1, 500, supported, []);
    if (!full.ok) throw new Error("refused");
    expect(full.selection.spreadByMix).toBe(false);
    expect(full.selection.rows[0].cefrLevel).toBe("B2");
  });

  it("spreads again when the number of exams changes", () => {
    const full = applyPreset(empty, presets, "FULL", 1, 500, supported, EVEN);
    if (!full.ok) throw new Error("refused");
    const twice = rescalePresetRows(full.selection, presets, 1, 2, 500, EVEN);
    if (!twice.ok) throw new Error("refused");
    expect(twice.selection.rows.map(rowTotal)).toEqual([12, 4]);
    expect(Object.values(totals(twice.selection.rows)).filter((n) => n > 0)).toEqual([4, 4, 4, 4]);
  });
});
