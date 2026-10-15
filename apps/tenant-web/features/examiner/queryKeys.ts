export const EXAMINER_QUERY_KEYS = {
  all: ["examiner"] as const,
  tenantScope: (tenantId: string) => [...EXAMINER_QUERY_KEYS.all, tenantId] as const,
  actorScope: (tenantId: string, actorId: string) =>
    [...EXAMINER_QUERY_KEYS.tenantScope(tenantId), actorId] as const,
  overview: (tenantId: string, actorId: string) =>
    [...EXAMINER_QUERY_KEYS.actorScope(tenantId, actorId), "overview"] as const,
  reportsPrefix: (tenantId: string, actorId: string) =>
    [...EXAMINER_QUERY_KEYS.actorScope(tenantId, actorId), "reports"] as const,
  reports: (
    tenantId: string,
    actorId: string,
    params?: {
      fromDate?: string;
      toDate?: string;
      taskType?: string;
      status?: string;
      sessionPublicId?: string;
    },
  ) =>
    params
      ? ([...EXAMINER_QUERY_KEYS.reportsPrefix(tenantId, actorId), params] as const)
      : EXAMINER_QUERY_KEYS.reportsPrefix(tenantId, actorId),
  queuePrefix: (tenantId: string, actorId: string) =>
    [...EXAMINER_QUERY_KEYS.actorScope(tenantId, actorId), "queue"] as const,
  queue: (
    tenantId: string,
    actorId: string,
    params?: {
      status?: string;
      page?: number;
      size?: number;
      sessionPublicId?: string;
      search?: string;
      sort?: string;
    },
  ) =>
    params
      ? ([...EXAMINER_QUERY_KEYS.queuePrefix(tenantId, actorId), params] as const)
      : EXAMINER_QUERY_KEYS.queuePrefix(tenantId, actorId),
  attemptPrefix: (tenantId: string, actorId: string) =>
    [...EXAMINER_QUERY_KEYS.actorScope(tenantId, actorId), "attempt"] as const,
  attempt: (tenantId: string, actorId: string, sessionPublicId: string, attemptPublicId: string) =>
    [
      ...EXAMINER_QUERY_KEYS.attemptPrefix(tenantId, actorId),
      sessionPublicId,
      attemptPublicId,
    ] as const,
  history: (tenantId: string, actorId: string, sessionPublicId: string, attemptPublicId: string, page: number, size: number) =>
    [
      ...EXAMINER_QUERY_KEYS.actorScope(tenantId, actorId),
      "history",
      sessionPublicId,
      attemptPublicId,
      { page, size },
    ] as const,
  guidelines: (tenantId: string, actorId: string, sessionPublicId: string, attemptPublicId: string) =>
    [
      ...EXAMINER_QUERY_KEYS.actorScope(tenantId, actorId),
      "guidelines",
      sessionPublicId,
      attemptPublicId,
    ] as const,
  issues: (tenantId: string, actorId: string, sessionPublicId: string, attemptPublicId: string) =>
    [
      ...EXAMINER_QUERY_KEYS.actorScope(tenantId, actorId),
      "issues",
      sessionPublicId,
      attemptPublicId,
    ] as const,
} as const;
