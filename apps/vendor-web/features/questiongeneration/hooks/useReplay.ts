import { useEffect, useState } from "react";

/**
 * True for `durationMs` after `trigger` first takes a value (and `enabled` holds), then false for good for that value.
 * Used to replay work the server did too fast to watch, such as a chart drawn in an instant.
 */
export function useReplay(trigger: string | null, enabled: boolean, durationMs: number): boolean {
  const [doneFor, setDoneFor] = useState<string | null>(null);
  const replaying = enabled && trigger !== null && doneFor !== trigger;

  useEffect(() => {
    if (!replaying) return;
    const timer = setTimeout(() => setDoneFor(trigger), durationMs);
    return () => clearTimeout(timer);
  }, [replaying, trigger, durationMs]);

  return replaying;
}
