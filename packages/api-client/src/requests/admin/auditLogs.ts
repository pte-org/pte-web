import type { ApiClient } from "../../client/client";
import type { AuditLogResponse } from "../../types/admin/auditLog";

export const AUDIT_LOG_ENDPOINTS = {
  auditLogs: "/api/admin/audit-logs",
} as const;

/** Tenant-wide audit trail, optionally filtered by aggregate type (e.g. "Program", "StudentClass"). Always `caller.tenantId()`-scoped server-side. */
export function listAuditLogs(client: ApiClient, aggregateType?: string): Promise<AuditLogResponse[]> {
  const query = aggregateType ? `?aggregateType=${encodeURIComponent(aggregateType)}` : "";
  return client.request<AuditLogResponse[]>(`${AUDIT_LOG_ENDPOINTS.auditLogs}${query}`);
}
