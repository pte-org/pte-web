export const AUDIT_LOGS_QUERY_KEY = ["auditLogs"] as const;

/** Mirrors admin's real `AdminConstants.AGGREGATE_PROGRAM`/`AGGREGATE_CLASS` string values exactly. */
export const AUDIT_LOG_AGGREGATE_TYPES = {
  PROGRAM: "Program",
  CLASS: "StudentClass",
} as const;

export const AUDIT_LOG_TEXT = {
  title: "Audit Log",
  subtitle: "A record of who changed what, and when.",
  scopeNote: (programLabel: string, classLabel: string) =>
    `This log covers ${programLabel}/${classLabel}/student-assignment changes only — exam session and enrollment activity isn't included yet.`,
  filterLabel: "Filter",
  filterAll: "All activity",
  loadFailed: "Couldn't load the audit log.",
  emptyTitle: "No activity yet",
  emptyText: "Changes here will appear as your team works.",
  unknownActor: "Unknown",
} as const;

export const AUDIT_LOG_TABLE_HEADERS = {
  WHEN: "When",
  ACTOR: "Actor",
  ACTION: "Action",
  SUMMARY: "Summary",
} as const;
