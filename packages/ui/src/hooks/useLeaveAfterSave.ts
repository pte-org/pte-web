"use client";

import { useRef } from "react";

export interface LeaveAfterSave {
  /** Use from `UnsavedChangesGuard.onSaveAndLeave`: remembers where to go, then runs the screen's save. */
  request: (proceed: () => void, save: () => void) => void;
  /** Call from the save's success callback: leaves if the save was started from the guard. */
  settle: () => void;
}

/**
 * Connects a screen's own save (which may be async or go through a form submit) to the guard's
 * "Save and leave". A save that fails never calls `settle`, so the user stays on the page.
 */
export function useLeaveAfterSave(): LeaveAfterSave {
  const proceedRef = useRef<(() => void) | null>(null);
  return {
    request: (proceed, save) => {
      proceedRef.current = proceed;
      save();
    },
    settle: () => {
      const proceed = proceedRef.current;
      proceedRef.current = null;
      proceed?.();
    },
  };
}
