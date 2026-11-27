import type {
  QuestionGenerationBatchCreateRequest,
  QuestionGenerationImageKind,
  QuestionGenerationJobCreateRequest,
  QuestionGenerationPreset,
  QuestionGenerationQuotaResponse,
  QuestionGenerationTaskTypeResponse,
} from "@pte/api-client";
import { parseTopicHints, topicHintsError } from "../../batchgeneration/utils/batchForm";
import { DESCRIBE_IMAGE_TASK } from "../constants";
import {
  GENERATION_FALLBACK_MAX_ITEMS_PER_BATCH,
  GENERATION_FALLBACK_SECONDS_PER_ITEM,
  type GenerationSection,
} from "../dialogConstants";
import { expandLevels, isSplitRow, rowTotal, type CefrLevelCounts } from "./generationCefr";
import { spreadRows, type CefrShare } from "./generationMix";

/** One ticked task type of the popup; it becomes one batch row, or one per CEFR level when split. */
export interface SelectionRow {
  taskType: string;
  section: string;
  /** The total; for a split row it always equals the sum of `levels`. */
  count: number;
  /** Ignored while `levels` is set. */
  cefrLevel: string;
  /** "Mixed levels": questions per CEFR level instead of one level. */
  levels?: CefrLevelCounts;
  /** Own topics, one per line; empty = the shared topics. */
  topicText: string;
  imageKind: QuestionGenerationImageKind;
}

export interface GenerationSelection {
  pool: string;
  defaultCefr: string;
  /** Topics for every row without its own, one per line. */
  sharedTopicText: string;
  rows: readonly SelectionRow[];
  /** The rows were spread over the active template's CEFR mix by the "full exam" preset. */
  spreadByMix?: boolean;
}

export type PresetKind = "FULL" | GenerationSection;
export type PresetResult =
  { ok: true; selection: GenerationSelection } | { ok: false; reason: "OVER_CAP"; total: number };
export type SubmitMode = "single" | "batch";
export type SelectionProblem =
  "EMPTY" | "COUNT" | "SPLIT_EMPTY" | "TOPICS" | "OVER_CAP" | "OVER_QUOTA";

export function newRow(
  taskType: string,
  section: string,
  cefrLevel: string,
  count = 1,
): SelectionRow {
  return { taskType, section, count, cefrLevel, topicText: "", imageKind: "AUTO" };
}

export function updateRow(
  selection: GenerationSelection,
  taskType: string,
  patch: Partial<Omit<SelectionRow, "taskType" | "section">>,
): GenerationSelection {
  return {
    ...selection,
    rows: selection.rows.map((row) => (row.taskType === taskType ? { ...row, ...patch } : row)),
  };
}

export function selectionTotal(selection: GenerationSelection): number {
  return selection.rows.reduce((sum, row) => sum + rowTotal(row), 0);
}

/** The batch cap in force: what the server reports, or its default for an older server. */
export function maxItemsPerBatch(quota: QuestionGenerationQuotaResponse | undefined): number {
  return quota?.maxItemsPerBatch ?? GENERATION_FALLBACK_MAX_ITEMS_PER_BATCH;
}

/** Remaining questions today, or null when no daily limit applies (or the server does not say). */
export function quotaRemaining(quota: QuestionGenerationQuotaResponse | undefined): number | null {
  if (!quota || quota.unlimited) return null;
  return quota.remaining ?? null;
}

/**
 * Fills the selection from the active template: FULL replaces every row with the template counts × multiplier; a
 * skill replaces only that skill's rows (×1). Types the generator does not support are skipped. A result above the
 * batch cap is refused with its total; counts are never clamped silently.
 */
function presetTaskTypes(
  presets: readonly QuestionGenerationPreset[],
  kind: PresetKind,
  supported: ReadonlySet<string>,
): QuestionGenerationPreset[] {
  return presets.filter(
    (preset) => supported.has(preset.taskType) && (kind === "FULL" || preset.section === kind),
  );
}

/** True when every task type the preset covers is already ticked. */
export function isPresetActive(
  selection: GenerationSelection,
  presets: readonly QuestionGenerationPreset[],
  kind: PresetKind,
  supported: ReadonlySet<string>,
): boolean {
  const chosen = presetTaskTypes(presets, kind, supported);
  return (
    chosen.length > 0 &&
    chosen.every((preset) => selection.rows.some((row) => row.taskType === preset.taskType))
  );
}

export function applyPreset(
  selection: GenerationSelection,
  presets: readonly QuestionGenerationPreset[],
  kind: PresetKind,
  multiplier: number,
  cap: number,
  supported: ReadonlySet<string>,
  shares: readonly CefrShare[] = [],
): PresetResult {
  const scale = multiplier;
  const chosen = presetTaskTypes(presets, kind, supported);
  const full = kind === "FULL";
  const kept = full ? [] : selection.rows.filter((row) => row.section !== kind);
  // A second click on an already applied preset clears what it ticked, so the buttons work as toggles.
  if (isPresetActive(selection, presets, kind, supported))
    return { ok: true, selection: { ...selection, rows: kept, spreadByMix: full ? false : selection.spreadByMix } };
  const presetRows = chosen.map((preset) =>
    newRow(preset.taskType, preset.section, selection.defaultCefr, preset.maxCount * scale),
  );
  // A whole exam follows the template's CEFR mix; a single skill keeps the default level.
  const spread = full && shares.length > 0;
  const next = {
    ...selection,
    rows: [...kept, ...(spread ? spreadRows(presetRows, shares) : presetRows)],
    spreadByMix: full ? spread : selection.spreadByMix,
  };
  const total = selectionTotal(next);
  return total > cap ? { ok: false, reason: "OVER_CAP", total } : { ok: true, selection: next };
}

/**
 * Re-applies the "number of exams" to rows still holding a preset count (maxCount × previous multiplier); rows the
 * author edited by hand keep their count. Refused, like a preset, when the new total is above the batch cap.
 */
export function rescalePresetRows(
  selection: GenerationSelection,
  presets: readonly QuestionGenerationPreset[],
  from: number,
  to: number,
  cap: number,
  shares: readonly CefrShare[] = [],
): PresetResult {
  const next = selection.spreadByMix && shares.length > 0
    ? { ...selection, rows: rescaleSpreadRows(selection.rows, presets, from, to, shares) }
    : {
        ...selection,
        rows: selection.rows.map((row) => {
          const preset = presets.find((candidate) => candidate.taskType === row.taskType);
          // A split row was spread over levels by hand, so it keeps its counts.
          return preset && !isSplitRow(row) && row.count === preset.maxCount * from
            ? { ...row, count: preset.maxCount * to }
            : row;
        }),
      };
  const total = selectionTotal(next);
  return total > cap ? { ok: false, reason: "OVER_CAP", total } : { ok: true, selection: next };
}

/**
 * The rows the mix spread still hold their preset total: they get the new total and are spread again as one exam, so
 * the exam stays on the mix; a row the author changed by hand keeps its counts.
 */
function rescaleSpreadRows(
  rows: readonly SelectionRow[],
  presets: readonly QuestionGenerationPreset[],
  from: number,
  to: number,
  shares: readonly CefrShare[],
): SelectionRow[] {
  const presetOf = (row: SelectionRow): QuestionGenerationPreset | undefined =>
    presets.find((candidate) => candidate.taskType === row.taskType);
  const untouched = rows.filter((row) => {
    const preset = presetOf(row);
    return preset !== undefined && rowTotal(row) === preset.maxCount * from;
  });
  const respread = spreadRows(
    untouched.map((row) => ({ ...row, levels: undefined, count: (presetOf(row)?.maxCount ?? 0) * to })),
    shares,
  );
  const byTaskType = new Map(respread.map((row) => [row.taskType, row]));
  return rows.map((row) => (untouched.includes(row) ? (byTaskType.get(row.taskType) ?? row) : row));
}

/** U1: one item of the editor's own task type keeps the in-form preview; anything else is a batch. */
export function resolveSubmitMode(
  selection: GenerationSelection,
  currentTaskType: string | undefined,
): SubmitMode {
  const [only] = selection.rows;
  // A matrix edit keeps rows in their per-level form, so "one question" is read from the expanded levels.
  const levels = only ? expandLevels(only) : [];
  const singleItem = selection.rows.length === 1 && levels.length === 1 && levels[0].count === 1;
  return singleItem && (currentTaskType === undefined || only.taskType === currentTaskType)
    ? "single"
    : "batch";
}

function rowTopics(selection: GenerationSelection, row: SelectionRow): string[] {
  return parseTopicHints(row.topicText.trim() ? row.topicText : selection.sharedTopicText);
}

function hasInvalidCount(row: SelectionRow): boolean {
  if (!isSplitRow(row)) return !Number.isInteger(row.count) || row.count < 1;
  return Object.values(row.levels).some((value) => !Number.isInteger(value) || value < 0);
}

export function validateSelection(
  selection: GenerationSelection,
  quota: QuestionGenerationQuotaResponse | undefined,
): SelectionProblem | null {
  if (selection.rows.length === 0) return "EMPTY";
  if (selection.rows.some(hasInvalidCount)) return "COUNT";
  if (selection.rows.some((row) => isSplitRow(row) && rowTotal(row) === 0)) return "SPLIT_EMPTY";
  if (selection.rows.some((row) => topicHintsError(rowTopics(selection, row)))) return "TOPICS";
  const total = selectionTotal(selection);
  if (total > maxItemsPerBatch(quota)) return "OVER_CAP";
  const remaining = quotaRemaining(quota);
  if (remaining !== null && total > remaining) return "OVER_QUOTA";
  return null;
}

/** One batch row per ticked task type, or per level holding questions of a split one (the server splits large rows). */
export function toBatchRequest(
  selection: GenerationSelection,
): QuestionGenerationBatchCreateRequest {
  return {
    pool: selection.pool,
    rows: selection.rows.flatMap((row) =>
      expandLevels(row).map(({ cefrLevel, count }) => ({
        taskType: row.taskType,
        cefrLevel,
        count,
        topicHints: rowTopics(selection, row),
        imageKind: row.taskType === DESCRIBE_IMAGE_TASK ? row.imageKind : null,
      })),
    ),
  };
}

/** The single preview job (one question into the form, nothing saved): its first topic, one per job. */
export function toSingleJobRequest(
  selection: GenerationSelection,
): QuestionGenerationJobCreateRequest {
  const [row] = selection.rows;
  return {
    taskType: row.taskType,
    cefrLevel: expandLevels(row)[0]?.cefrLevel ?? row.cefrLevel,
    pool: selection.pool,
    topicHint: rowTopics(selection, row)[0] ?? null,
    count: 1,
    saveQuestions: false,
    ...(row.taskType === DESCRIBE_IMAGE_TASK ? { imageKind: row.imageKind } : {}),
  };
}

/** Sequential run: questions × the task type's estimate. */
export function estimateSeconds(
  selection: GenerationSelection,
  taskTypes: readonly QuestionGenerationTaskTypeResponse[],
): number {
  const perItem = new Map(taskTypes.map((type) => [type.taskType, type.estimatedSecondsPerItem]));
  return selection.rows.reduce(
    (sum, row) =>
      sum + rowTotal(row) * (perItem.get(row.taskType) ?? GENERATION_FALLBACK_SECONDS_PER_ITEM),
    0,
  );
}
