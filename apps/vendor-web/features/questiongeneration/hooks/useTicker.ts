import { useEffect, useState } from "react";

/** A counter that rises every `intervalMs` while mounted, for animations that move in steps. */
export function useTicker(intervalMs: number): number {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick((current) => current + 1), intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);
  return tick;
}
