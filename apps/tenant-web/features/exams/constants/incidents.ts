import type { IncidentStatus } from "@pte/api-client";

/**
 * Forward handling and reopening before the immutable CLOSED state. Host no longer escalates;
 * the ESCALATED row only lets legacy escalated incidents be taken back or resolved.
 */
export const HOST_INCIDENT_TRANSITIONS: Record<IncidentStatus, readonly IncidentStatus[]> = {
  NEW: ["IN_PROGRESS"],
  IN_PROGRESS: ["RESOLVED"],
  ESCALATED: ["IN_PROGRESS", "RESOLVED"],
  RESOLVED: ["CLOSED", "IN_PROGRESS"],
  CLOSED: [],
};
