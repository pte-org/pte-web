import {
  GENERATION_CEFR_LEVELS,
  GENERATION_SECTIONS,
  type GenerationCefrLevel,
} from "../dialogConstants";
import { isSplitRow, rowTotal, setLevelCount, splitRow } from "./generationCefr";
import {
  newRow,
  selectionTotal,
  type GenerationSelection,
  type PresetResult,
  type SelectionRow,
} from "./generationSelection";

/** A task type the generator supports, as the matrix lists it. */
export interface MatrixTaskType {
  taskType: string;
  section: string;
}

/** Questions of a row at one level: a split row's own count there, a single-level row's count on its level. */
export function cellValue(row: SelectionRow | undefined, level: GenerationCefrLevel): number {
  if (!row) return 0;
  if (isSplitRow(row)) return row.levels[level] ?? 0;
  return row.cefrLevel === level ? rowTotal(row) : 0;
}

/**
 * Sets one cell. Editing a cell always works on the per-level form of the row; a row left with no question is
 * removed, so an empty line in the matrix is the same as an unticked task type.
 */
export function setCell(
  selection: GenerationSelection,
  type: MatrixTaskType,
  level: GenerationCefrLevel,
  value: number,
): GenerationSelection {
  const count = Number.isInteger(value) && value > 0 ? value : 0;
  const existing = selection.rows.find((row) => row.taskType === type.taskType);
  const base = existing ?? newRow(type.taskType, type.section, level, 0);
  const next = setLevelCount(splitRow(base), level, count);
  const rows = existing
    ? selection.rows.map((row) => (row.taskType === type.taskType ? next : row))
    : [...selection.rows, next];
  return { ...selection, rows: rows.filter((row) => rowTotal(row) > 0) };
}

/**
 * "N per task type": every supported type gets N questions at the default level, keeping its own topics and
 * picture kind. Refused like a preset when the result is above the batch cap.
 */
export function fillEachTaskType(
  selection: GenerationSelection,
  types: readonly MatrixTaskType[],
  perType: number,
  cap: number,
): PresetResult {
  const rows = types.map((type) => {
    const kept = selection.rows.find((row) => row.taskType === type.taskType);
    const fresh = newRow(type.taskType, type.section, selection.defaultCefr, perType);
    return kept ? { ...fresh, topicText: kept.topicText, imageKind: kept.imageKind } : fresh;
  });
  const next = { ...selection, rows };
  const total = selectionTotal(next);
  return total > cap ? { ok: false, reason: "OVER_CAP", total } : { ok: true, selection: next };
}

/** The matrix is exactly "N per task type": every supported type, and nothing else, has N questions. */
export function isFillEachActive(
  selection: GenerationSelection,
  types: readonly MatrixTaskType[],
  perType: number,
): boolean {
  return (
    types.length > 0 &&
    selection.rows.length === types.length &&
    types.every((type) => {
      const row = selection.rows.find((candidate) => candidate.taskType === type.taskType);
      return row !== undefined && rowTotal(row) === perType;
    })
  );
}

/** Questions per CEFR level over the whole selection (the side panel's distribution). */
export function levelTotals(selection: GenerationSelection): Record<GenerationCefrLevel, number> {
  return Object.fromEntries(
    GENERATION_CEFR_LEVELS.map((level) => [
      level,
      selection.rows.reduce((sum, row) => sum + cellValue(row, level), 0),
    ]),
    // fromEntries over the full level list yields exactly one key per level.
  ) as Record<GenerationCefrLevel, number>;
}

/** Questions per skill over the whole selection. */
export function sectionTotals(selection: GenerationSelection): Record<string, number> {
  return Object.fromEntries(
    GENERATION_SECTIONS.map((section) => [
      section,
      selection.rows
        .filter((row) => row.section === section)
        .reduce((sum, row) => sum + rowTotal(row), 0),
    ]),
  );
}
