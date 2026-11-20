"use client";

import { useCallback, useMemo, useState } from "react";
import { STANDARD_TASK_WEIGHTS } from "../constants/scoringWeights";
import { generateStudents, type MockStudent } from "../utils/mockStudents";
import { scoreAttempt, type ScoredResult } from "../utils/scoringEngine";

export const COHORT_SIZE = 50;
export const LAST_STAGE = 3;
const INITIAL_SEED = 2026;
const SEED_RANGE = 1_000_000;

export interface ScoredStudent extends MockStudent {
  result: ScoredResult;
}

export interface ScoringSimulation {
  seed: number | null;
  stage: number;
  students: ScoredStudent[];
  selectedId: number | null;
  generate: () => void;
  advance: () => void;
  finish: () => void;
  select: (id: number) => void;
}

/** Stage 0 = answers submitted; 1 = task averages; 2 = skill scores; 3 = overall. */
export const useScoringSimulation = (): ScoringSimulation => {
  const [seed, setSeed] = useState<number | null>(null);
  const [stage, setStage] = useState(0);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const students = useMemo<ScoredStudent[]>(
    () =>
      seed === null
        ? []
        : generateStudents(COHORT_SIZE, seed).map((student) => ({
            ...student,
            result: scoreAttempt(STANDARD_TASK_WEIGHTS, student.scores),
          })),
    [seed],
  );

  const generate = useCallback(() => {
    setSeed((current) =>
      current === null ? INITIAL_SEED : Math.floor(Math.random() * SEED_RANGE),
    );
    setStage(0);
    setSelectedId(1);
  }, []);

  return {
    seed,
    stage,
    students,
    selectedId,
    generate,
    advance: () => setStage((current) => Math.min(LAST_STAGE, current + 1)),
    finish: () => setStage(LAST_STAGE),
    select: setSelectedId,
  };
};
