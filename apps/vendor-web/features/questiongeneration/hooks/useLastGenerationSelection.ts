"use client";

import { useCallback, useState } from "react";
import { GENERATION_LAST_SELECTION_STORAGE_KEY } from "../dialogConstants";
import type { GenerationSelection } from "../utils/generationSelection";

function isSelection(value: unknown): value is GenerationSelection {
  if (typeof value !== "object" || value === null) return false;
  // Narrowing a parsed JSON value: each field read below is checked before it is trusted.
  const candidate = value as Partial<GenerationSelection>;
  return (
    typeof candidate.pool === "string" &&
    typeof candidate.defaultCefr === "string" &&
    typeof candidate.sharedTopicText === "string" &&
    Array.isArray(candidate.rows)
  );
}

function readStored(): GenerationSelection | null {
  try {
    const raw = window.localStorage.getItem(GENERATION_LAST_SELECTION_STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    return isSelection(parsed) && parsed.rows.length > 0 ? parsed : null;
  } catch {
    // Storage blocked (private mode) or a value from an older shape: there is simply no "last time".
    return null;
  }
}

export interface LastGenerationSelection {
  last: GenerationSelection | null;
  remember: (selection: GenerationSelection) => void;
}

/** "Same as last time": the selection of the last batch started from this browser. */
export function useLastGenerationSelection(): LastGenerationSelection {
  const [last] = useState<GenerationSelection | null>(() =>
    typeof window === "undefined" ? null : readStored(),
  );
  const remember = useCallback((selection: GenerationSelection) => {
    try {
      window.localStorage.setItem(GENERATION_LAST_SELECTION_STORAGE_KEY, JSON.stringify(selection));
    } catch {
      // A full or blocked storage only loses the shortcut, never the batch.
    }
  }, []);
  return { last, remember };
}
