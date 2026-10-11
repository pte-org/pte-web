export const PROCTOR_QUERY_KEYS = {
  all: ["proctor"] as const,
  myAssignmentsPrefix: () =>
    [...PROCTOR_QUERY_KEYS.all, "assignments", "mine"] as const,
  myAssignments: (page?: number, size?: number) =>
    page !== undefined || size !== undefined
      ? ([...PROCTOR_QUERY_KEYS.myAssignmentsPrefix(), { page, size }] as const)
      : PROCTOR_QUERY_KEYS.myAssignmentsPrefix(),
  monitoringSnapshotPrefix: (sessionPublicId: string) =>
    [...PROCTOR_QUERY_KEYS.all, "monitoring", sessionPublicId] as const,
  monitoringSnapshot: (sessionPublicId: string, page?: number, size?: number) =>
    page !== undefined || size !== undefined
      ? ([...PROCTOR_QUERY_KEYS.monitoringSnapshotPrefix(sessionPublicId), { page, size }] as const)
      : PROCTOR_QUERY_KEYS.monitoringSnapshotPrefix(sessionPublicId),
  studentAttemptsPrefix: (sessionPublicId: string, studentPublicId: string) =>
    [...PROCTOR_QUERY_KEYS.all, "students", studentPublicId, "attempts", sessionPublicId] as const,
  studentAttempts: (sessionPublicId: string, studentPublicId: string, page?: number, size?: number) =>
    page !== undefined || size !== undefined
      ? ([...PROCTOR_QUERY_KEYS.studentAttemptsPrefix(sessionPublicId, studentPublicId), { page, size }] as const)
      : PROCTOR_QUERY_KEYS.studentAttemptsPrefix(sessionPublicId, studentPublicId),
  violations: (sessionPublicId: string) =>
    [...PROCTOR_QUERY_KEYS.all, "violations", sessionPublicId] as const,
  securityAuditPrefix: (sessionPublicId: string) =>
    [...PROCTOR_QUERY_KEYS.all, "security-audit", sessionPublicId] as const,
  securityAudit: (sessionPublicId: string, limit?: number) =>
    limit !== undefined
      ? ([...PROCTOR_QUERY_KEYS.securityAuditPrefix(sessionPublicId), { limit }] as const)
      : PROCTOR_QUERY_KEYS.securityAuditPrefix(sessionPublicId),
} as const;
