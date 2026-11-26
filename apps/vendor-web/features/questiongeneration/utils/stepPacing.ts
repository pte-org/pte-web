import type { LaneStatus } from "../liveConstants";

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
