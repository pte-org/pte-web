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

/** One ticked task type of the popup; it becomes exactly one batch row. */
export interface SelectionRow {
  taskType: string;
  section: string;
  count: number;
  cefrLevel: string;
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
}

export type PresetKind = "FULL" | GenerationSection;
export type PresetResult = { ok: true; selection: GenerationSelection } | { ok: false; reason: "OVER_CAP"; total: number };
export type SubmitMode = "single" | "batch";
export type SelectionProblem = "EMPTY" | "COUNT" | "TOPICS" | "OVER_CAP" | "OVER_QUOTA";

export function newRow(taskType: string, section: string, cefrLevel: string, count = 1): SelectionRow {
  return { taskType, section, count, cefrLevel, topicText: "", imageKind: "AUTO" };
}

export function isTicked(selection: GenerationSelection, taskType: string): boolean {
  return selection.rows.some((row) => row.taskType === taskType);
}

export function toggleRow(selection: GenerationSelection, taskType: string, section: string): GenerationSelection {
  const rows = isTicked(selection, taskType)
    ? selection.rows.filter((row) => row.taskType !== taskType)
    : [...selection.rows, newRow(taskType, section, selection.defaultCefr)];
  return { ...selection, rows };
}

export function updateRow(
  selection: GenerationSelection,
  taskType: string,
  patch: Partial<Omit<SelectionRow, "taskType" | "section">>,
): GenerationSelection {
  return { ...selection, rows: selection.rows.map((row) => (row.taskType === taskType ? { ...row, ...patch } : row)) };
}

export function selectionTotal(selection: GenerationSelection): number {
  return selection.rows.reduce((sum, row) => sum + (Number.isInteger(row.count) && row.count > 0 ? row.count : 0), 0);
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
  return presets.filter((preset) => supported.has(preset.taskType) && (kind === "FULL" || preset.section === kind));
}

/** True when every task type the preset covers is already ticked. */
export function isPresetActive(
  selection: GenerationSelection,
  presets: readonly QuestionGenerationPreset[],
  kind: PresetKind,
  supported: ReadonlySet<string>,
): boolean {
  const chosen = presetTaskTypes(presets, kind, supported);
  return chosen.length > 0 && chosen.every((preset) => selection.rows.some((row) => row.taskType === preset.taskType));
}

export function applyPreset(
  selection: GenerationSelection,
  presets: readonly QuestionGenerationPreset[],
  kind: PresetKind,
  multiplier: number,
  cap: number,
  supported: ReadonlySet<string>,
): PresetResult {
  const scale = multiplier;
  const chosen = presetTaskTypes(presets, kind, supported);
  const kept = kind === "FULL" ? [] : selection.rows.filter((row) => row.section !== kind);
  // A second click on an already applied preset clears what it ticked, so the buttons work as toggles.
  if (isPresetActive(selection, presets, kind, supported)) return { ok: true, selection: { ...selection, rows: kept } };
  const presetRows = chosen.map((preset) => newRow(preset.taskType, preset.section, selection.defaultCefr, preset.maxCount * scale));
  const next = { ...selection, rows: [...kept, ...presetRows] };
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
): PresetResult {
  const rows = selection.rows.map((row) => {
    const preset = presets.find((candidate) => candidate.taskType === row.taskType);
    return preset && row.count === preset.maxCount * from ? { ...row, count: preset.maxCount * to } : row;
  });
  const next = { ...selection, rows };
  const total = selectionTotal(next);
  return total > cap ? { ok: false, reason: "OVER_CAP", total } : { ok: true, selection: next };
}

/** U1: one item of the editor's own task type keeps the in-form preview; anything else is a batch. */
export function resolveSubmitMode(selection: GenerationSelection, currentTaskType: string | undefined): SubmitMode {
  const [only] = selection.rows;
  const singleItem = selection.rows.length === 1 && only.count === 1;
  return singleItem && (currentTaskType === undefined || only.taskType === currentTaskType) ? "single" : "batch";
}

function rowTopics(selection: GenerationSelection, row: SelectionRow): string[] {
  return parseTopicHints(row.topicText.trim() ? row.topicText : selection.sharedTopicText);
}

export function validateSelection(
  selection: GenerationSelection,
  quota: QuestionGenerationQuotaResponse | undefined,
): SelectionProblem | null {
  if (selection.rows.length === 0) return "EMPTY";
  if (selection.rows.some((row) => !Number.isInteger(row.count) || row.count < 1)) return "COUNT";
  if (selection.rows.some((row) => topicHintsError(rowTopics(selection, row)))) return "TOPICS";
  const total = selectionTotal(selection);
  if (total > maxItemsPerBatch(quota)) return "OVER_CAP";
  const remaining = quotaRemaining(quota);
  if (remaining !== null && total > remaining) return "OVER_QUOTA";
  return null;
}

/** One batch row per ticked task type (the server splits large rows itself). */
export function toBatchRequest(selection: GenerationSelection): QuestionGenerationBatchCreateRequest {
  return {
    pool: selection.pool,
    rows: selection.rows.map((row) => ({
      taskType: row.taskType,
      cefrLevel: row.cefrLevel,
      count: row.count,
      topicHints: rowTopics(selection, row),
      imageKind: row.taskType === DESCRIBE_IMAGE_TASK ? row.imageKind : null,
    })),
  };
}

/** The single preview job (one question into the form, nothing saved): its first topic, one per job. */
export function toSingleJobRequest(selection: GenerationSelection): QuestionGenerationJobCreateRequest {
  const [row] = selection.rows;
  return {
    taskType: row.taskType,
    cefrLevel: row.cefrLevel,
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
    (sum, row) => sum + Math.max(0, row.count) * (perItem.get(row.taskType) ?? GENERATION_FALLBACK_SECONDS_PER_ITEM),
    0,
  );
}
