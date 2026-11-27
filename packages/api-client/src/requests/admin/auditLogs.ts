import { DEFAULT_PAGE_SIZE, type ApiClient, type PagedResult } from "../../client/client";
import type {
  AuditLogDetailResponse,
  AuditLogResponse,
  PlatformAuditScope,
} from "../../types/admin/auditLog";
import type { UserDirectoryEntryResponse } from "../../types/user";

export const AUDIT_LOG_ENDPOINTS = {
  auditLogs: "/api/v1/audit-logs",
  platformAuditLogs: "/api/v1/platform/audit-logs",
  platformActors: "/api/v1/platform-users/directory",
} as const;

/** Tenant-wide audit trail, optionally filtered by aggregate type (e.g. "Program", "StudentClass"). Always `caller.tenantId()`-scoped server-side. */
export function listAuditLogs(
  client: ApiClient,
  aggregateType?: string,
  page = 0,
  size = DEFAULT_PAGE_SIZE,
  search?: string,
  createdFrom?: string,
  createdTo?: string,
): Promise<PagedResult<AuditLogResponse>> {
  const params = new URLSearchParams({ page: String(page), size: String(size) });
  if (aggregateType) params.set("aggregateType", aggregateType);
  const normalizedSearch = search?.trim();
  if (normalizedSearch) params.set("search", normalizedSearch);
  if (createdFrom) params.set("createdFrom", createdFrom);
  if (createdTo) params.set("createdTo", createdTo);
  return client.request<PagedResult<AuditLogResponse>>(
    `${AUDIT_LOG_ENDPOINTS.auditLogs}?${params.toString()}`,
  );
}

/** Platform-wide audit trail. The API returns only tenantless platform rows. */
export function listPlatformAuditLogs(
  client: ApiClient,
  aggregateType?: string,
  page = 0,
  size = DEFAULT_PAGE_SIZE,
  search?: string,
  createdFrom?: string,
  createdTo?: string,
  scope: PlatformAuditScope = {},
): Promise<PagedResult<AuditLogResponse>> {
  const params = new URLSearchParams({ page: String(page), size: String(size) });
  if (aggregateType) params.set("aggregateType", aggregateType);
  if (scope.actorId) params.set("actorId", scope.actorId);
  if (scope.aggregateId) params.set("aggregateId", scope.aggregateId);
  const normalizedSearch = search?.trim();
  if (normalizedSearch) params.set("search", normalizedSearch);
  if (createdFrom) params.set("createdFrom", createdFrom);
  if (createdTo) params.set("createdTo", createdTo);
  return client.request<PagedResult<AuditLogResponse>>(
    `${AUDIT_LOG_ENDPOINTS.platformAuditLogs}?${params.toString()}`,
  );
}

/** One platform entry with its before/after snapshots (platform staff only: snapshots may hold answer keys). */
export function getPlatformAuditLog(
  client: ApiClient,
  publicId: string,
): Promise<AuditLogDetailResponse> {
  return client.request<AuditLogDetailResponse>(
    `${AUDIT_LOG_ENDPOINTS.platformAuditLogs}/${encodeURIComponent(publicId)}`,
  );
}

/** Platform-user names used to resolve actors in the vendor audit table. */
export function listPlatformAuditActors(client: ApiClient): Promise<UserDirectoryEntryResponse[]> {
  return client.request<UserDirectoryEntryResponse[]>(AUDIT_LOG_ENDPOINTS.platformActors);
}
