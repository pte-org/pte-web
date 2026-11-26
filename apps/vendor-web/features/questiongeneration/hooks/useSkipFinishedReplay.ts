"use client";

import { useState } from "react";
import { SKIP_FINISHED_STORAGE_KEY } from "../typingConstants";

const STORED_ON = "1";
const STORED_OFF = "0";

export const readSkipFinished = (): boolean => {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(SKIP_FINISHED_STORAGE_KEY) === STORED_ON;
  } catch {
    // Storage blocked: the choice is simply not remembered.
    return false;
  }
};

/** Whether a question that has already finished is shown as it ended instead of being replayed; kept in this browser. */
export function useSkipFinishedReplay(): { skip: boolean; setSkip: (skip: boolean) => void } {
  const [skip, setSkipState] = useState<boolean>(readSkipFinished);
  const setSkip = (next: boolean): void => {
    setSkipState(next);
    try {
      window.localStorage.setItem(SKIP_FINISHED_STORAGE_KEY, next ? STORED_ON : STORED_OFF);
    } catch {
      // Not remembered when storage is blocked; the choice still applies on this page.
    }
  };
  return { skip, setSkip };
}
