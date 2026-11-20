"use client";

import { useCallback, useState } from "react";
import type { QuestionGenerationPreset } from "@pte/api-client";
import type { GenerationCefrLevel } from "../dialogConstants";
import { applySkillCefr, collapseRow, setLevelCount, splitRow } from "../utils/generationCefr";
import { GENERATION_DEFAULT_CEFR, GENERATION_DEFAULT_POOL, PRESET_MULTIPLIER_MIN } from "../dialogConstants";
import {
  applyPreset,
  rescalePresetRows,
  newRow,
  toggleRow,
  updateRow,
  type GenerationSelection,
  type PresetKind,
  type SelectionRow,
} from "../utils/generationSelection";

export interface InitialTaskType {
  taskType: string;
  section: string;
}

export interface GenerationSelectionState {
  selection: GenerationSelection;
  multiplier: number;
  /** Total of the last refused preset (above the batch cap), shown until the next change. */
  overCapTotal: number | null;
  setMultiplier: (value: number, presets: readonly QuestionGenerationPreset[], cap: number) => void;
  setShared: (patch: Partial<Pick<GenerationSelection, "pool" | "defaultCefr" | "sharedTopicText">>) => void;
  toggle: (taskType: string, section: string) => void;
  update: (taskType: string, patch: Partial<Omit<SelectionRow, "taskType" | "section">>) => void;
  /** CEFR for every single-level row of a skill, and for rows ticked there later. */
  setSkillCefr: (section: string, cefrLevel: string) => void;
  /** "Mixed levels" (true) or back to one level (false). */
  setSplit: (taskType: string, split: boolean) => void;
  setLevel: (taskType: string, level: GenerationCefrLevel, value: number) => void;
  preset: (kind: PresetKind, presets: readonly QuestionGenerationPreset[], cap: number, supported: ReadonlySet<string>) => void;
  reset: (initial?: InitialTaskType) => void;
}

function initialSelection(initial?: InitialTaskType): GenerationSelection {
  return {
    pool: GENERATION_DEFAULT_POOL,
    defaultCefr: GENERATION_DEFAULT_CEFR,
    sharedTopicText: "",
    rows: initial ? [newRow(initial.taskType, initial.section, GENERATION_DEFAULT_CEFR)] : [],
  };
}

function mapRow(
  selection: GenerationSelection,
  taskType: string,
  transform: (row: SelectionRow) => SelectionRow,
): GenerationSelection {
  return { ...selection, rows: selection.rows.map((row) => (row.taskType === taskType ? transform(row) : row)) };
}

/** The popup's choices; every update makes a new selection (no mutation). */
export function useGenerationSelection(initial?: InitialTaskType): GenerationSelectionState {
  const [selection, setSelection] = useState<GenerationSelection>(() => initialSelection(initial));
  const [multiplier, setMultiplier] = useState(PRESET_MULTIPLIER_MIN);
  const [overCapTotal, setOverCapTotal] = useState<number | null>(null);

  const change = useCallback((next: (current: GenerationSelection) => GenerationSelection) => {
    setOverCapTotal(null);
    setSelection(next);
  }, []);

  const preset = useCallback<GenerationSelectionState["preset"]>((kind, presets, cap, supported) => {
    const result = applyPreset(selection, presets, kind, multiplier, cap, supported);
    if (result.ok) {
      setOverCapTotal(null);
      setSelection(result.selection);
    } else {
      setOverCapTotal(result.total);
    }
  }, [selection, multiplier]);

  const changeMultiplier = useCallback<GenerationSelectionState["setMultiplier"]>((value, presets, cap) => {
    const result = rescalePresetRows(selection, presets, multiplier, value, cap);
    if (!result.ok) {
      setOverCapTotal(result.total);
      return;
    }
    setOverCapTotal(null);
    setMultiplier(value);
    setSelection(result.selection);
  }, [selection, multiplier]);

  return {
    selection,
    multiplier,
    overCapTotal,
    setMultiplier: changeMultiplier,
    setShared: (patch) => change((current) => ({ ...current, ...patch })),
    toggle: (taskType, section) => change((current) => toggleRow(current, taskType, section)),
    update: (taskType, patch) => change((current) => updateRow(current, taskType, patch)),
    setSkillCefr: (section, cefrLevel) => change((current) => applySkillCefr(current, section, cefrLevel)),
    setSplit: (taskType, split) => change((current) => mapRow(current, taskType, split ? splitRow : collapseRow)),
    setLevel: (taskType, level, value) =>
      change((current) => mapRow(current, taskType, (row) => setLevelCount(row, level, value))),
    preset,
    reset: (next) => {
      setOverCapTotal(null);
      setMultiplier(PRESET_MULTIPLIER_MIN);
      setSelection(initialSelection(next));
    },
  };
}
