"use client";

import { useState } from "react";
import {
  INITIAL_ANSWERS,
  SIM_TASKS,
  OUTCOME_CYCLE,
  toItemScores,
  type StudentAnswers,
} from "../constants/miniExam";
import { scoreAttempt, type ScoredResult } from "../utils/scoringEngine";

export const LAST_STAGE = 3;

export interface ScoringSimulation {
  answers: readonly StudentAnswers[];
  results: ScoredResult[];
  stage: number;
  selected: number;
  toggle: (student: number, taskKey: string, item: number) => void;
  select: (student: number) => void;
  setStage: (stage: number) => void;
  reset: () => void;
}

/** Stage 0 = answers; 1 = question-type averages; 2 = skill scores; 3 = overall. */
export const useScoringSimulation = (): ScoringSimulation => {
  const [answers, setAnswers] = useState<readonly StudentAnswers[]>(INITIAL_ANSWERS);
  const [stage, setStageState] = useState(0);
  const [selected, setSelected] = useState(0);

  const toggle = (student: number, taskKey: string, item: number): void =>
    setAnswers((current) =>
      current.map((studentAnswers, index) =>
        index !== student
          ? studentAnswers
          : {
              ...studentAnswers,
              [taskKey]: studentAnswers[taskKey].map((outcome, position) =>
                position === item ? OUTCOME_CYCLE[outcome] : outcome,
              ),
            },
      ),
    );

  return {
    answers,
    results: answers.map((studentAnswers) => scoreAttempt(SIM_TASKS, toItemScores(studentAnswers))),
    stage,
    selected,
    toggle,
    select: setSelected,
    setStage: (next) => setStageState(Math.min(LAST_STAGE, Math.max(0, next))),
    reset: () => setAnswers(INITIAL_ANSWERS),
  };
};
