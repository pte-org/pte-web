import type { AttemptStatus, ProctorAuditAction } from "./types";

/**
 * React Query cache-key roots.
 *
 * Named constants per this repo's established convention (avoids raw-string
 * query-key drift/collisions across the proctor feature and shared features).
 */
export const PROCTOR_LIVE_ATTEMPTS_QUERY_KEY = ["proctor", "liveAttempts"] as const;
export const PROCTOR_AUDIT_LOG_QUERY_KEY = ["proctor", "auditLog"] as const;
export const PROCTOR_AUDIT_SECURITY_QUERY_KEY = ["proctor", "securityAudit"] as const;

/** Default poll cadence for the live monitoring view. */
export const POLL_INTERVAL_MS = 3000;

export const ATTEMPT_STATUS_LABELS: Record<AttemptStatus, string> = {
  PENDING: "Pending",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
};

export const AUDIT_ACTION_LABELS: Record<ProctorAuditAction, string> = {
  FORCE_SUBMIT: "Force submit",
  FLAG_VIOLATION: "Flag violation",
  CLOSE_SESSION: "Close session",
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

export const PROCTOR_AUDIT_TEXT = {
  TITLE: "Session audit log",
  SUBTITLE:
    "Post-hoc review of proctor actions and security audit events for this session.",
  TAB_VIOLATIONS: "Violations",
  TAB_SECURITY: "Security audit",
  LOADING_VIOLATIONS: "Loading violations…",
  LOADING_AUDIT: "Loading security audit…",
  EMPTY_VIOLATIONS_TITLE: "No violations flagged",
  EMPTY_VIOLATIONS_DESCRIPTION:
    "Violations will appear here once the backend endpoint is wired up. The UI shape ships first.",
  EMPTY_AUDIT_TITLE: "No security audit entries",
  EMPTY_AUDIT_DESCRIPTION:
    "Security audit entries will appear here once the backend endpoint is wired up.",
  LOAD_MORE: "Load more",
  END_OF_AUDIT: "End of audit log",
  COL_TIME: "Time",
  COL_TYPE: "Type",
  COL_PROCTOR: "Proctor",
  COL_DESCRIPTION: "Description",
  COL_HASH: "Hash position",
  BACK_TO_PROFILE: "Back to profile",
} as const;

export const PROCTOR_PROFILE_TEXT = {
  TITLE: "Proctor profile",
  SUBTITLE: "Your account details. This view is read-only.",
  FULL_NAME_LABEL: "Full name",
  EMAIL_LABEL: "Email",
  ROLES_LABEL: "Roles",
  STATUS_LABEL: "Status",
  TENANT_LABEL: "Tenant",
  LOADING: "Loading profile…",
  ERROR_TITLE: "Could not load profile",
  ERROR_DESCRIPTION: "Try refreshing the page. If the problem persists, contact your host admin.",
  EMPTY_FULL_NAME: "(no name set)",
  EMPTY_TENANT: "(no tenant)",
  ROLES_SEPARATOR: ", ",
  RETRY: "Retry",
} as const;