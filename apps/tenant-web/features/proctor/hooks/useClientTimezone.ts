"use client";

import { useEffect, useState } from "react";

export function useClientTimezone(): {
  timezone: string | null;
  isResolved: boolean;
} {
  const [timezone, setTimezone] = useState<string | null>(null);

  useEffect(() => {
    try {
      const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (detected) {
        setTimezone(detected);
      }
    } catch {
      // Intl timezone lookup fallback
    }

    const handleFocus = (): void => {
      try {
        const current = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (current) {
          setTimezone((prev) => (prev !== current ? current : prev));
        }
      } catch {
        // ignore
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  return {
    timezone,
    isResolved: timezone !== null,
  };
}

export function useMidnightBoundaryRefresh({
  dayEnd,
  timezone,
  onMidnight,
}: {
  dayEnd: string | undefined;
  timezone: string | null;
  onMidnight: () => void;
}): void {
  useEffect(() => {
    if (!dayEnd || !timezone) return;

    const targetTime = new Date(dayEnd).getTime();
    if (Number.isNaN(targetTime)) return;

    const now = Date.now();
    const delay = targetTime - now + 1000;

    let fired = false;
    let timeoutId: NodeJS.Timeout | null = null;

    // Up to 26 hours to safely handle 25-hour DST transition days
    if (delay > 0 && delay <= 26 * 3600 * 1000) {
      timeoutId = setTimeout(() => {
        fired = true;
        if (typeof document !== "undefined" && document.visibilityState === "visible") {
          onMidnight();
        }
      }, delay);
    }

    const handleVisibilityOrFocus = (): void => {
      // If boundary already elapsed or timer fired while hidden, trigger onMidnight upon focus/visibility
      if (fired || Date.now() >= targetTime) {
        onMidnight();
      }
    };

    window.addEventListener("focus", handleVisibilityOrFocus);
    document.addEventListener("visibilitychange", handleVisibilityOrFocus);

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      window.removeEventListener("focus", handleVisibilityOrFocus);
      document.removeEventListener("visibilitychange", handleVisibilityOrFocus);
    };
  }, [dayEnd, timezone, onMidnight]);
}
