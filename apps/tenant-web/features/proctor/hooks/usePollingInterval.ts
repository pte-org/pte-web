"use client";

import { useEffect, useState } from "react";

export interface PollingOptions {
  /**
   * Polling interval in milliseconds. Pass `0` to disable polling entirely
   * (the returned object's `refetchInterval` will be `false`).
   */
  intervalMs: number;
  /**
   * Whether polling should keep running while the tab is in the background.
   * Default `false` — proctoring sessions stop spending bandwidth when the
   * operator has tabbed away to another window.
   */
  whenHidden?: boolean;
}

export interface ResolvedPolling {
  refetchInterval: number | false;
  refetchIntervalInBackground: boolean;
}

/**
 * Returns the right pair of values to feed into TanStack Query's
 * `refetchInterval` + `refetchIntervalInBackground` for a given cadence. Also
 * tracks the current tab's `visibilitychange` so a hidden tab pauses
 * immediately (not on the next tick) — when the proctor comes back to the
 * page they see fresh data on the very next refetch instead of waiting for
 * the in-flight interval to expire.
 */
export function usePollingInterval({ intervalMs, whenHidden = false }: PollingOptions): ResolvedPolling {
  const [isVisible, setIsVisible] = useState<boolean>(() =>
    typeof document === "undefined" ? true : document.visibilityState === "visible",
  );

  useEffect(() => {
    if (whenHidden) return;
    if (typeof document === "undefined") return;
    const handle = (): void => setIsVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", handle);
    return () => document.removeEventListener("visibilitychange", handle);
  }, [whenHidden]);

  if (intervalMs <= 0) {
    return { refetchInterval: false, refetchIntervalInBackground: false };
  }
  if (whenHidden) {
    return { refetchInterval: intervalMs, refetchIntervalInBackground: true };
  }
  return { refetchInterval: isVisible ? intervalMs : false, refetchIntervalInBackground: false };
}