export const AUDIT_LOGS_QUERY_KEY = ["auditLogs"] as const;
export const AUDIT_LOG_ACTORS_QUERY_KEY = ["auditLogActors"] as const;

/** Mirrors the backend `EnrollmentConstants.AGGREGATE_PROGRAM`/`AGGREGATE_CLASS` string values exactly. */
export const AUDIT_LOG_AGGREGATE_TYPES = {
  PROGRAM: "Program",
  CLASS: "TrainingClass",
} as const;

export const AUDIT_LOG_TEXT = {
  title: "System log",
  subtitle: "A record of who changed what, and when.",
  filterLabel: "Filter",
  filterAll: "All activity",
  loadFailed: "Couldn't load the system log.",
  emptyTitle: "No activity yet",
  emptyText: "Changes here will appear as your team works.",
  unknownActor: "Unknown",
  totalItems: (count: number) => `Showing ${count} entr${count === 1 ? "y" : "ies"}`,
} as const;

export const AUDIT_LOG_TABLE_HEADERS = {
  WHEN: "When",
  AGGREGATE_TYPE: "Resource",
  ACTOR: "Actor",
  ACTION: "Action",
  SUMMARY: "Summary",
} as const;

export const AUDIT_LOG_RESOURCE_TYPES = [
  { value: "Tenant", label: "Tenant" },
  { value: "Organization", label: "Organization" },
  { value: "Program", label: "Program" },
  { value: "TrainingClass", label: "Class" },
  { value: "User", label: "User" },
  { value: "ExamSession", label: "Exam session" },
  { value: "SupportTicket", label: "Support ticket" },
] as const;
