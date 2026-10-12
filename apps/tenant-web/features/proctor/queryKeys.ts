export const PROCTOR_QUERY_KEYS = {
  all: ["proctor"] as const,
  tenantScope: (tenantId: string) => [...PROCTOR_QUERY_KEYS.all, tenantId] as const,
  actorScope: (tenantId: string, actorId: string) =>
    [...PROCTOR_QUERY_KEYS.tenantScope(tenantId), actorId] as const,
  overview: (tenantId: string, actorId: string, timezone: string) =>
    [...PROCTOR_QUERY_KEYS.actorScope(tenantId, actorId), "overview", timezone] as const,
  myAssignmentsPrefix: (tenantId: string, actorId: string) =>
    [...PROCTOR_QUERY_KEYS.actorScope(tenantId, actorId), "assignments", "mine"] as const,
  myAssignments: (
    tenantId: string,
    actorId: string,
    params?: {
      page?: number;
      size?: number;
      scope?: string;
      sort?: string;
      timezone?: string;
    },
  ) => {
    const base = PROCTOR_QUERY_KEYS.myAssignmentsPrefix(tenantId, actorId);
    if (!params) return base;
    const cleanParams: Record<string, unknown> = {};
    if (params.page !== undefined) cleanParams.page = params.page;
    if (params.size !== undefined) cleanParams.size = params.size;
    if (params.scope !== undefined) cleanParams.scope = params.scope;
    if (params.sort !== undefined) cleanParams.sort = params.sort;
    if (params.timezone !== undefined) cleanParams.timezone = params.timezone;
    return Object.keys(cleanParams).length > 0 ? ([...base, cleanParams] as const) : base;
  },
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
