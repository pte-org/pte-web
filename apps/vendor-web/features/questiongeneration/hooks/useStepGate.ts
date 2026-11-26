"use client";

import { useState } from "react";
import type { QuestionGenerationLiveItem } from "@pte/api-client";
import { FIRST_GATE_RANK, endedBadly, stageRank } from "../utils/stepGate";

export interface StepGate {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
  /** How far the screen may show the question (a step rank, see GATE_STEPS). */
  rank: number;
  /** The server is already past what the screen shows, so the person can continue. */
  ahead: boolean;
  release: () => void;
}

/**
 * Stops the replay of a question after each step when the person asks for it. Only the screen waits: the server keeps
 * working, and what it did meanwhile is shown once the person continues. Each question starts from its first step.
 */
export function useStepGate(live: QuestionGenerationLiveItem | undefined): StepGate {
  const index = live?.index ?? -1;
  const actual = stageRank(live?.stage);
  const [enabled, setEnabledState] = useState(false);
  const [gate, setGate] = useState({ index, released: FIRST_GATE_RANK });
  const released = gate.index === index ? gate.released : FIRST_GATE_RANK;
  const gating = enabled && !endedBadly(live);
  const rank = gating ? Math.min(actual, released) : actual;
  return {
    enabled,
    // Turned on midway, the screen stops at the step it shows now instead of going back to the first one.
    setEnabled: (next) => {
      if (next) setGate({ index, released: actual });
      setEnabledState(next);
    },
    rank,
    ahead: gating && actual > rank,
    release: () => setGate({ index, released: rank + 1 }),
  };
}
