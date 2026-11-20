"use client";

import { useState } from "react";
import { LAB_SPECS, labItemScore, startingValues } from "../constants/labItems";
import { contributingSkills, STANDARD_TASK_WEIGHTS, type SkillKey } from "../constants/scoringWeights";
import { scoreAttempt, type ScoredResult } from "../utils/scoringEngine";

/** Control values per question type (trait levels, counts, picks). */
export type LabValues = Record<string, number[]>;

export const initialLabValues = (): LabValues =>
  Object.fromEntries(STANDARD_TASK_WEIGHTS.map((task) => [task.key, startingValues(LAB_SPECS[task.key])]));

const extremeValues = (best: boolean): LabValues =>
  Object.fromEntries(
    STANDARD_TASK_WEIGHTS.map((task) => [
      task.key,
      LAB_SPECS[task.key].controls.map((control) => (best === (control.key !== "wrongPicks") ? control.max : 0)),
    ]),
  );

export const labItemScores = (values: LabValues): Record<string, number> =>
  Object.fromEntries(STANDARD_TASK_WEIGHTS.map((task) => [task.key, labItemScore(LAB_SPECS[task.key], values[task.key])]));

/** One sample item per question type, so the type's average equals that item's score. */
export const scoreLab = (values: LabValues): ScoredResult => {
  const items = labItemScores(values);
  return scoreAttempt(
    STANDARD_TASK_WEIGHTS,
    Object.fromEntries(Object.entries(items).map(([key, score]) => [key, [score]])),
  );
};

export interface ScoreLab {
  values: LabValues;
  itemScores: Record<string, number>;
  result: ScoredResult;
  focused: string | null;
  open: string | null;
  highlighted: ReadonlySet<SkillKey>;
  setValue: (taskKey: string, index: number, value: number) => void;
  setAll: (best: boolean) => void;
  reset: () => void;
  focus: (taskKey: string | null) => void;
  toggle: (taskKey: string) => void;
}

export const useScoreLab = (): ScoreLab => {
  const [values, setValues] = useState<LabValues>(initialLabValues);
  const [focused, setFocused] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>("DESCRIBE_IMAGE");
  const focusedTask = STANDARD_TASK_WEIGHTS.find((task) => task.key === (focused ?? open));
  return {
    values,
    itemScores: labItemScores(values),
    result: scoreLab(values),
    focused,
    open,
    highlighted: new Set(focusedTask ? contributingSkills(focusedTask) : []),
    setValue: (taskKey, index, value) =>
      setValues((current) => ({
        ...current,
        [taskKey]: current[taskKey].map((old, position) => (position === index ? value : old)),
      })),
    setAll: (best) => setValues(extremeValues(best)),
    reset: () => setValues(initialLabValues()),
    focus: setFocused,
    toggle: (taskKey) => setOpen((current) => (current === taskKey ? null : taskKey)),
  };
};
