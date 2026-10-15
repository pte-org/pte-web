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
  attendanceRosterPrefix: (sessionPublicId: string) =>
    [...PROCTOR_QUERY_KEYS.all, "attendance", sessionPublicId] as const,
  attendanceRoster: (
    sessionPublicId: string,
    params?: { status?: string; search?: string; page?: number; size?: number },
  ) => {
    const base = PROCTOR_QUERY_KEYS.attendanceRosterPrefix(sessionPublicId);
    if (!params) return base;
    return [...base, params] as const;
  },
  attendanceReceipt: (sessionPublicId: string, requestPublicId: string) =>
    [...PROCTOR_QUERY_KEYS.all, "attendance", sessionPublicId, "receipt", requestPublicId] as const,
  attendanceHistoryPrefix: (sessionPublicId: string, studentPublicId: string) =>
    [...PROCTOR_QUERY_KEYS.all, "attendance", sessionPublicId, "history", studentPublicId] as const,
  attendanceHistory: (
    sessionPublicId: string,
    studentPublicId: string,
    page?: number,
    size?: number,
  ) => {
    const base = PROCTOR_QUERY_KEYS.attendanceHistoryPrefix(sessionPublicId, studentPublicId);
    if (page === undefined && size === undefined) return base;
    return [...base, { page, size }] as const;
  },
  incidentsListPrefix: (sessionPublicId: string) =>
    [...PROCTOR_QUERY_KEYS.all, "incidents", sessionPublicId] as const,
  incidentsList: (
    sessionPublicId: string,
    params?: { status?: string; page?: number; size?: number },
  ) => {
    const base = PROCTOR_QUERY_KEYS.incidentsListPrefix(sessionPublicId);
    if (!params) return base;
    return [...base, params] as const;
  },
  incidentDetail: (sessionPublicId: string, incidentPublicId: string) =>
    [...PROCTOR_QUERY_KEYS.all, "incidents", sessionPublicId, incidentPublicId] as const,
  incidentHistory: (sessionPublicId: string, incidentPublicId: string) =>
    [...PROCTOR_QUERY_KEYS.all, "incidents", sessionPublicId, incidentPublicId, "history"] as const,
} as const;
