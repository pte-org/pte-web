"use client";

import { useState } from "react";
import { OUTCOME_SCORE, SIM_TASKS, type Outcome } from "../constants/miniExam";
import { contributingSkills, STANDARD_TASK_WEIGHTS, type SkillKey } from "../constants/scoringWeights";
import { scoreAttempt, type ScoredResult } from "../utils/scoringEngine";

export type LabOutcomes = Record<string, Outcome>;

/** A mixed starting point so every skill starts somewhere in the middle of the scale. */
const START_PATTERN: readonly Outcome[] = ["correct", "partial", "correct", "wrong", "partial"];

export const initialLabOutcomes = (): LabOutcomes =>
  Object.fromEntries(STANDARD_TASK_WEIGHTS.map((task, index) => [task.key, START_PATTERN[index % START_PATTERN.length]]));

/** Every item of a question type gets the same outcome, so the type's average is exactly 100, 50 or 0. */
export const scoreLab = (outcomes: LabOutcomes): ScoredResult =>
  scoreAttempt(
    SIM_TASKS,
    Object.fromEntries(SIM_TASKS.map((task) => [task.key, Array(task.items).fill(OUTCOME_SCORE[outcomes[task.key]])])),
  );

export interface ScoreLab {
  outcomes: LabOutcomes;
  result: ScoredResult;
  focused: string | null;
  highlighted: ReadonlySet<SkillKey>;
  setOutcome: (taskKey: string, outcome: Outcome) => void;
  setAll: (outcome: Outcome) => void;
  reset: () => void;
  focus: (taskKey: string | null) => void;
}

export const useScoreLab = (): ScoreLab => {
  const [outcomes, setOutcomes] = useState<LabOutcomes>(initialLabOutcomes);
  const [focused, setFocused] = useState<string | null>(null);
  const focusedTask = STANDARD_TASK_WEIGHTS.find((task) => task.key === focused);
  return {
    outcomes,
    result: scoreLab(outcomes),
    focused,
    highlighted: new Set(focusedTask ? contributingSkills(focusedTask) : []),
    setOutcome: (taskKey, outcome) => setOutcomes((current) => ({ ...current, [taskKey]: outcome })),
    setAll: (outcome) =>
      setOutcomes(Object.fromEntries(STANDARD_TASK_WEIGHTS.map((task) => [task.key, outcome]))),
    reset: () => setOutcomes(initialLabOutcomes()),
    focus: setFocused,
  };
};
