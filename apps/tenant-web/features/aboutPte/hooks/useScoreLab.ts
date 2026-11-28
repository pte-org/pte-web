"use client";

import { useState } from "react";
import { LAB_SPECS, startingValues } from "../constants/labItems";
import { contributingSkills, STANDARD_TASK_WEIGHTS, type SkillKey } from "../constants/scoringWeights";
import { labItemScores, scoreLab, valuesForTarget, type LabValues } from "../utils/labScoring";
import type { ScoredResult } from "../utils/scoringEngine";

export { labItemScores, scoreLab, type LabValues };

export const initialLabValues = (): LabValues =>
  Object.fromEntries(STANDARD_TASK_WEIGHTS.map((task) => [task.key, startingValues(LAB_SPECS[task.key])]));

const extremeValues = (best: boolean): LabValues =>
  Object.fromEntries(
    STANDARD_TASK_WEIGHTS.map((task) => [
      task.key,
      LAB_SPECS[task.key].controls.map((control) => (best === (control.key !== "wrongPicks") ? control.max : 0)),
    ]),
  );

export interface ScoreLab {
  values: LabValues;
  itemScores: Record<string, number>;
  result: ScoredResult;
  focused: string | null;
  open: string | null;
  highlighted: ReadonlySet<SkillKey>;
  /** The target score of the preset in use; null once any control has been changed by hand. */
  activePreset: number | null;
  setValue: (taskKey: string, index: number, value: number) => void;
  setAll: (best: boolean) => void;
  applyPreset: (targetScore: number) => void;
  reset: () => void;
  focus: (taskKey: string | null) => void;
  toggle: (taskKey: string) => void;
}

export const useScoreLab = (): ScoreLab => {
  const [values, setValues] = useState<LabValues>(initialLabValues);
  const [focused, setFocused] = useState<string | null>(null);
  const [activePreset, setActivePreset] = useState<number | null>(null);
  const [open, setOpen] = useState<string | null>("DESCRIBE_IMAGE");
  const focusedTask = STANDARD_TASK_WEIGHTS.find((task) => task.key === (focused ?? open));
  return {
    values,
    itemScores: labItemScores(values),
    result: scoreLab(values),
    focused,
    open,
    highlighted: new Set(focusedTask ? contributingSkills(focusedTask) : []),
    activePreset,
    setValue: (taskKey, index, value) => {
      setActivePreset(null);
      setValues((current) => ({
        ...current,
        [taskKey]: current[taskKey].map((old, position) => (position === index ? value : old)),
      }));
    },
    setAll: (best) => {
      setActivePreset(null);
      setValues(extremeValues(best));
    },
    applyPreset: (targetScore) => {
      setActivePreset(targetScore);
      setValues(valuesForTarget(targetScore));
    },
    reset: () => {
      setActivePreset(null);
      setValues(initialLabValues());
    },
    focus: setFocused,
    toggle: (taskKey) => setOpen((current) => (current === taskKey ? null : taskKey)),
  };
};
