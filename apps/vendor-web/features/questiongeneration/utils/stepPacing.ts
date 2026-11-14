import type { LaneStatus } from "../liveConstants";

const SETTLED: readonly LaneStatus[] = ["done", "failed"];

/** How many steps, from the first, have finished (done or failed). */
export function settledCount(statuses: readonly LaneStatus[]): number {
  const firstOpen = statuses.findIndex((status) => !SETTLED.includes(status));
  return firstOpen === -1 ? statuses.length : firstOpen;
}

/**
 * The steps as shown when only the first `shown` finished steps have been revealed yet. A step the agents finished
 * before it could be seen is shown running, and the steps after it waiting, so each one stays on screen a moment.
 */
export function pacedStatuses(statuses: readonly LaneStatus[], shown: number): LaneStatus[] {
  if (shown >= settledCount(statuses)) return [...statuses];
  return statuses.map((status, index) => {
    if (index < shown) return status;
    return index === shown ? "active" : "waiting";
  });
}

/** The status of a whole question from its stage, for the icon of its row. */
export function itemStatus(stage: string): LaneStatus {
  switch (stage) {
    case "QUEUED":
    case "CANCELLED":
      return "waiting";
    case "READY":
    case "SAVED":
      return "done";
    case "FAILED":
      return "failed";
    default:
      return "active";
  }
}
