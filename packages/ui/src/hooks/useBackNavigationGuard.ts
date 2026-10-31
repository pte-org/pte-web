"use client";

import { useCallback, useEffect, useRef, type MutableRefObject } from "react";

/** How long the "user already confirmed" flag outlives the navigation call. */
const CONFIRMED_RESET_MS = 1000;

export interface BackNavigationGuard {
  /** True from the moment the user confirmed leaving until just after the navigation. */
  confirmedRef: MutableRefObject<boolean>;
  /** The user chose to stay after pressing Back: put the guard entry back. */
  stay: () => void;
  /** The user confirmed leaving after pressing Back: carry on to the previous page. */
  leaveBack: () => void;
  /** The user confirmed leaving through a link: drop the guard entry first, then run `go`. */
  leaveThen: (go: () => void) => void;
}

/**
 * Catches the browser's Back button while `isDirty`. There is no API to block a history
 * navigation, so a throw-away entry with the same URL is pushed on top of the page: Back
 * then lands on the real entry (same URL, nothing visible changes) and `onBackAttempt`
 * fires so the caller can ask. The entry is removed again as soon as nothing is unsaved,
 * so Back needs one press in the normal case.
 */
export function useBackNavigationGuard(
  isDirty: boolean,
  onBackAttempt: () => void,
): BackNavigationGuard {
  const isDirtyRef = useRef(isDirty);
  const onBackAttemptRef = useRef(onBackAttempt);
  // The guard entry is on top of the history stack.
  const hasEntryRef = useRef(false);
  // We called history.back() to remove the guard entry and its popstate has not arrived yet.
  const popInFlightRef = useRef(false);
  const confirmedRef = useRef(false);

  const sync = useCallback((): void => {
    if (popInFlightRef.current) return;
    if (isDirtyRef.current && !hasEntryRef.current) {
      // Keep the current state object so the framework's own history bookkeeping stays valid.
      window.history.pushState(window.history.state, "", window.location.href);
      hasEntryRef.current = true;
    } else if (!isDirtyRef.current && hasEntryRef.current) {
      hasEntryRef.current = false;
      popInFlightRef.current = true;
      window.history.back();
    }
  }, []);

  useEffect(() => {
    onBackAttemptRef.current = onBackAttempt;
  }, [onBackAttempt]);

  useEffect(() => {
    isDirtyRef.current = isDirty;
    sync();
  }, [isDirty, sync]);

  useEffect(() => {
    const handlePopState = (): void => {
      if (popInFlightRef.current) {
        // Our own clean-up landed; the user may have made new changes while it was in flight.
        popInFlightRef.current = false;
        sync();
        return;
      }
      if (confirmedRef.current || !hasEntryRef.current) return;
      // The user pressed Back from the guard entry and now stands on the real one.
      hasEntryRef.current = false;
      onBackAttemptRef.current();
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [sync]);

  const markConfirmed = useCallback((): void => {
    confirmedRef.current = true;
    window.setTimeout(() => {
      confirmedRef.current = false;
    }, CONFIRMED_RESET_MS);
  }, []);

  const stay = useCallback((): void => sync(), [sync]);

  const leaveBack = useCallback((): void => {
    markConfirmed();
    window.history.back();
  }, [markConfirmed]);

  const leaveThen = useCallback(
    (go: () => void): void => {
      markConfirmed();
      if (!hasEntryRef.current) {
        go();
        return;
      }
      // Step off the guard entry first, so the destination does not leave a stray entry behind.
      hasEntryRef.current = false;
      window.addEventListener("popstate", () => go(), { once: true });
      window.history.back();
    },
    [markConfirmed],
  );

  return { confirmedRef, stay, leaveBack, leaveThen };
}
