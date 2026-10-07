import type { AttemptStatus } from "./types";

/**
 * React Query cache-key roots.
 *
 * Named constants per this repo's established convention (avoids raw-string
 * query-key drift/collisions across the proctor feature and shared features).
 */
export const PROCTOR_LIVE_ATTEMPTS_QUERY_KEY = ["proctor", "liveAttempts"] as const;

/** Default poll cadence for the live monitoring view. */
export const POLL_INTERVAL_MS = 3000;

export const ATTEMPT_STATUS_LABELS: Record<AttemptStatus, string> = {
  PENDING: "Pending",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
};

export const PROCTOR_LIVE_TEXT = {
  TITLE: "Live monitoring",
  SUBTITLE:
    "Real-time view of attempts for this session. Polling is enabled at 3-second intervals.",
  SESSION_ID_LABEL: "Session",
  LOADING: "Loading session attempts…",
  COL_ATTEMPT: "Attempt",
  COL_STUDENT: "Student",
  COL_STATUS: "Status",
  COL_LAST_HEARTBEAT: "Last heartbeat",
  COL_FLAGS: "Flagged",
  COL_NOTES: "Notes",
  FORCE_SUBMIT: "Force submit",
  FLAG_VIOLATION: "Flag violation",
  CLOSE_SESSION: "Close session",
  ACTIONS_DISABLED_HINT:
    "Proctor actions are pending backend availability. The UI shape ships first; mutations follow in a separate plan.",
  EMPTY_ATTEMPTS_TITLE: "No live attempts yet",
  EMPTY_ATTEMPTS_DESCRIPTION:
    "Live monitoring will populate once the backend endpoint is wired up. This page is gated behind the proctor feature flag and is safe to ship.",
  BACK_TO_PROFILE: "Back to profile",
} as const;