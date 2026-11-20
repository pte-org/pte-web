import { GENERATION_CEFR_LEVELS, type GenerationCefrLevel } from "../dialogConstants";
import type { GenerationSelection, SelectionRow } from "./generationSelection";

/** Questions per CEFR level of a split row; every level is present (0 = none). */
export type CefrLevelCounts = Readonly<Record<GenerationCefrLevel, number>>;

function validCount(value: number): number {
  return Number.isInteger(value) && value > 0 ? value : 0;
}

export function isSplitRow(row: SelectionRow): row is SelectionRow & { levels: CefrLevelCounts } {
  return row.levels !== undefined;
}

/** The row's question total: the sum of its levels when split, else its count (invalid counts add nothing). */
export function rowTotal(row: SelectionRow): number {
  if (!isSplitRow(row)) return validCount(row.count);
  return GENERATION_CEFR_LEVELS.reduce((sum, level) => sum + validCount(row.levels[level]), 0);
}

function emptyLevels(): Record<GenerationCefrLevel, number> {
  return { A1: 0, A2: 0, B1: 0, B2: 0, C1: 0, C2: 0 };
}

/** "Mixed levels": the whole current count moves onto the row's level, ready to be spread out. */
export function splitRow(row: SelectionRow): SelectionRow {
  if (isSplitRow(row)) return row;
  const level = (GENERATION_CEFR_LEVELS as readonly string[]).includes(row.cefrLevel) ? row.cefrLevel : "B2";
  const levels = { ...emptyLevels(), [level]: validCount(row.count) };
  return { ...row, levels, count: rowTotal({ ...row, levels }) };
}

/** "Single level": keeps the total and takes the level holding the most questions (ties: the lower level). */
export function collapseRow(row: SelectionRow): SelectionRow {
  if (!isSplitRow(row)) return row;
  const largest = GENERATION_CEFR_LEVELS.reduce((best, level) =>
    validCount(row.levels[level]) > validCount(row.levels[best]) ? level : best, GENERATION_CEFR_LEVELS[0]);
  const { levels, ...plain } = row;
  void levels;
  return { ...plain, cefrLevel: largest, count: rowTotal(row) };
}

/** Changes one level of a split row; the count follows as the new total. */
export function setLevelCount(row: SelectionRow, level: GenerationCefrLevel, value: number): SelectionRow {
  if (!isSplitRow(row)) return row;
  const levels = { ...row.levels, [level]: value };
  return { ...row, levels, count: rowTotal({ ...row, levels }) };
}

/** The level every ticked single-level row of a skill shares, or null when they differ (or none is ticked). */
export function skillCefrValue(selection: GenerationSelection, section: string): string | null {
  const levels = new Set(
    selection.rows.filter((row) => row.section === section && !isSplitRow(row)).map((row) => row.cefrLevel),
  );
  if (levels.size === 1) return [...levels][0];
  return levels.size === 0 ? selection.skillCefr?.[section] ?? null : null;
}

/**
 * "CEFR for the whole skill": sets every ticked single-level row of the skill and becomes the level of rows ticked
 * later in that skill. Split rows are left untouched — their per-level counts were chosen by hand.
 */
export function applySkillCefr(selection: GenerationSelection, section: string, cefrLevel: string): GenerationSelection {
  return {
    ...selection,
    skillCefr: { ...selection.skillCefr, [section]: cefrLevel },
    rows: selection.rows.map((row) =>
      row.section === section && !isSplitRow(row) ? { ...row, cefrLevel } : row),
  };
}

/** One batch row per level holding questions; a single-level row gives itself. */
export function expandLevels(row: SelectionRow): { cefrLevel: string; count: number }[] {
  if (!isSplitRow(row)) return [{ cefrLevel: row.cefrLevel, count: row.count }];
  return GENERATION_CEFR_LEVELS.filter((level) => validCount(row.levels[level]) > 0)
    .map((level) => ({ cefrLevel: level, count: row.levels[level] }));
}
