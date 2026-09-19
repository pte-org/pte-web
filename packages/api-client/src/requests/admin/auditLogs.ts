import type { ApiClient, PagedResult } from "../../client/client";
import type { AuditLogResponse } from "../../types/admin/auditLog";

export const AUDIT_LOG_ENDPOINTS = {
  auditLogs: "/api/v1/audit-logs",
} as const;

/** Tenant-wide audit trail, optionally filtered by aggregate type (e.g. "Program", "StudentClass"). Always `caller.tenantId()`-scoped server-side. */
export function listAuditLogs(
  client: ApiClient,
  aggregateType?: string,
  page = 0,
  size = 20,
): Promise<PagedResult<AuditLogResponse>> {
  const params = new URLSearchParams({ page: String(page), size: String(size) });
  if (aggregateType) params.set("aggregateType", aggregateType);
  return client.request<PagedResult<AuditLogResponse>>(
    `${AUDIT_LOG_ENDPOINTS.auditLogs}?${params.toString()}`,
  );
}
