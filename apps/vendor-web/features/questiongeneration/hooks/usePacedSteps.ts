import { useEffect, useState } from "react";
import { STEP_MIN_VISIBLE_MS, type LaneStatus } from "../liveConstants";
import { pacedStatuses, settledCount } from "../utils/stepPacing";

interface Revealed {
  key: string | number;
  count: number;
}

/**
 * The steps of one question, revealed one at a time: a step finished by the agents is shown as done only after the
 * one before it has been on screen for a moment. Steps already finished when the question is opened show at once.
 */
export function usePacedSteps(statuses: readonly LaneStatus[], resetKey: string | number): LaneStatus[] {
  const target = settledCount(statuses);
  const [revealed, setRevealed] = useState<Revealed>({ key: resetKey, count: target });
  // Another question was picked: show it as it stands, without replaying its steps.
  if (revealed.key !== resetKey) setRevealed({ key: resetKey, count: target });

  useEffect(() => {
    if (revealed.count >= target) return;
    const timer = setTimeout(() => setRevealed((current) => ({ ...current, count: current.count + 1 })),
      STEP_MIN_VISIBLE_MS);
    return () => clearTimeout(timer);
  }, [revealed, target]);

  return pacedStatuses(statuses, revealed.count);
}
