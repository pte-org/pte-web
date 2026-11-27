"use client";

import { useCallback, useState } from "react";
import type { QuestionGenerationPreset } from "@pte/api-client";
import {
  GENERATION_DEFAULT_CEFR,
  GENERATION_DEFAULT_POOL,
  GENERATION_UNDO_LIMIT,
  PRESET_MULTIPLIER_MIN,
  type GenerationCefrLevel,
} from "../dialogConstants";
import { fillEachTaskType, setCell, type MatrixTaskType } from "../utils/generationMatrix";
import { singleLevelRows, type CefrShare } from "../utils/generationMix";
import {
  applyPreset,
  newRow,
  rescalePresetRows,
  updateRow,
  type GenerationSelection,
  type PresetKind,
  type PresetResult,
  type SelectionRow,
} from "../utils/generationSelection";

export type InitialTaskType = MatrixTaskType;

export interface GenerationSelectionState {
  selection: GenerationSelection;
  multiplier: number;
  /** Total of the last refused preset (above the batch cap), shown until the next change. */
  overCapTotal: number | null;
  canUndo: boolean;
  fillEach: (types: readonly MatrixTaskType[], perType: number, cap: number) => void;
  setMultiplier: (
    value: number,
    presets: readonly QuestionGenerationPreset[],
    cap: number,
    shares: readonly CefrShare[],
  ) => void;
  setShared: (
    patch: Partial<Pick<GenerationSelection, "pool" | "defaultCefr" | "sharedTopicText">>,
  ) => void;
  /** Own topics or picture kind of a row. */
  update: (taskType: string, patch: Partial<Pick<SelectionRow, "topicText" | "imageKind">>) => void;
  setCell: (type: MatrixTaskType, level: GenerationCefrLevel, value: number) => void;
  preset: (
    kind: PresetKind,
    presets: readonly QuestionGenerationPreset[],
    cap: number,
    supported: ReadonlySet<string>,
    shares: readonly CefrShare[],
  ) => void;
  /** Undoes the template's CEFR spread: every row goes back to the default level. */
  singleLevel: () => void;
  /** Replaces the whole selection, e.g. with the one of the last started batch. */
  restore: (selection: GenerationSelection) => void;
  clear: () => void;
  undo: () => void;
}

function initialSelection(initial?: InitialTaskType): GenerationSelection {
  return {
    pool: GENERATION_DEFAULT_POOL,
    defaultCefr: GENERATION_DEFAULT_CEFR,
    sharedTopicText: "",
    rows: initial ? [newRow(initial.taskType, initial.section, GENERATION_DEFAULT_CEFR)] : [],
  };
}

/** The popup's choices; every update makes a new selection (no mutation) and can be undone. */
export function useGenerationSelection(initial?: InitialTaskType): GenerationSelectionState {
  const [selection, setSelection] = useState<GenerationSelection>(() => initialSelection(initial));
  const [history, setHistory] = useState<GenerationSelection[]>([]);
  const [multiplier, setMultiplier] = useState(PRESET_MULTIPLIER_MIN);
  const [overCapTotal, setOverCapTotal] = useState<number | null>(null);

  const commit = useCallback(
    (next: GenerationSelection) => {
      setOverCapTotal(null);
      setHistory((past) => [...past, selection].slice(-GENERATION_UNDO_LIMIT));
      setSelection(next);
    },
    [selection],
  );

  const commitResult = useCallback(
    (result: PresetResult): boolean => {
      if (!result.ok) {
        setOverCapTotal(result.total);
        return false;
      }
      commit(result.selection);
      return true;
    },
    [commit],
  );

  return {
    selection,
    multiplier,
    overCapTotal,
    canUndo: history.length > 0,
    fillEach: (types, count, cap) => {
      commitResult(fillEachTaskType(selection, types, count, cap));
    },
    setMultiplier: (value, presets, cap, shares) => {
      if (commitResult(rescalePresetRows(selection, presets, multiplier, value, cap, shares)))
        setMultiplier(value);
    },
    // Settings and topics are typed key by key: they are not undo steps, the undo button is for the matrix.
    setShared: (patch) => setSelection((current) => ({ ...current, ...patch })),
    update: (taskType, patch) => setSelection((current) => updateRow(current, taskType, patch)),
    setCell: (type, level, value) => commit(setCell(selection, type, level, value)),
    preset: (kind, presets, cap, supported, shares) => {
      commitResult(applyPreset(selection, presets, kind, multiplier, cap, supported, shares));
    },
    singleLevel: () =>
      commit({
        ...selection,
        rows: singleLevelRows(selection.rows, selection.defaultCefr),
        spreadByMix: false,
      }),
    restore: (next) => commit(next),
    clear: () => commit({ ...selection, rows: [] }),
    undo: () => {
      const previous = history[history.length - 1];
      if (!previous) return;
      setOverCapTotal(null);
      setHistory(history.slice(0, -1));
      setSelection(previous);
    },
  };
}
