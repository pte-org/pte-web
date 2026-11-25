import type { AttendanceStatus } from "@pte/api-client";

/**
 * React Query cache-key roots.
 *
 * Named constants per this repo's established convention (avoids raw-string
 * query-key drift/collisions across the proctor feature and shared features).
 */
/** Poll cadence for the session header and other proctor views that must follow status changes. */
export const POLL_INTERVAL_MS = 3000;

/** Attempt status (from the attendance row) for which force submit is offered. */
export const ATTEMPT_IN_PROGRESS = "IN_PROGRESS";
export const ATTEMPT_SUBMITTED = "SUBMITTED";

/** Force submit from the attendance roster: only for a Student whose attempt is in progress. */
export function getAttendanceBadgeVariant(
  status: AttendanceStatus,
): "success" | "warning" | "danger" | "neutral" {
  switch (status) {
    case "PRESENT":
      return "success";
    case "LATE":
      return "warning";
    case "ABSENT":
      return "danger";
    case "UNMARKED":
    default:
      return "neutral";
  }
}

