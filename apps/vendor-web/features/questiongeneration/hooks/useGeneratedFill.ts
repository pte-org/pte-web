"use client";

import { useMemo, useSyncExternalStore } from "react";
import type { CreateQuestionRequest } from "@pte/api-client";
import type { AgentFill } from "../editorAgent";
import { readGeneratedFill } from "../utils/generatedFill";

const noSubscription = (): (() => void) => () => undefined;

/**
 * The question a form-started generation job wrote, as values for the question form. The run's page stores it in
 * this tab before coming back, so the form fills even though the job is over. Null when nothing was stored.
 */
export function useGeneratedFill(jobId: string | null): AgentFill | null {
  const raw = useSyncExternalStore(
    noSubscription,
    () => (jobId ? readGeneratedFill(jobId) : null),
    () => null,
  );
  return useMemo(() => {
    if (!raw) return null;
    const values = JSON.parse(raw) as Partial<CreateQuestionRequest>;
    return { values, marks: {}, locked: false };
  }, [raw]);
}
