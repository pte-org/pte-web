"use client";

import {
  DEFAULT_PAGE_SIZE,
  getPlatformAuditLog,
  listPlatformAuditActors,
  listPlatformAuditLogs,
  type AuditLogDetailResponse,
  type AuditLogResponse,
  type PagedResult,
  type PlatformAuditScope,
  type UserDirectoryEntryResponse,
} from "@pte/api-client";
import { keepPreviousData, useQuery, type UseQueryResult } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import {
  ACTORS_STALE_TIME_MS,
  PLATFORM_AUDIT_ACTORS_QUERY_KEY,
  PLATFORM_AUDIT_ENTRY_QUERY_KEY,
  PLATFORM_AUDIT_LOG_QUERY_KEY,
} from "./constants";

export interface PlatformAuditLogEntry {
  log: AuditLogResponse;
  actorName: string | null;
}

export function usePlatformAuditActors(): UseQueryResult<UserDirectoryEntryResponse[]> {
  return useQuery({
    queryKey: PLATFORM_AUDIT_ACTORS_QUERY_KEY,
    queryFn: () => listPlatformAuditActors(apiClient),
    staleTime: ACTORS_STALE_TIME_MS,
  });
}

export function usePlatformAuditLogs(
  aggregateType?: string,
  page = 0,
  size = DEFAULT_PAGE_SIZE,
  search = "",
  createdFrom = "",
  createdTo = "",
  scope: PlatformAuditScope = {},
): UseQueryResult<PagedResult<PlatformAuditLogEntry>> {
  const actors = usePlatformAuditActors();

  return useQuery<PagedResult<AuditLogResponse>, Error, PagedResult<PlatformAuditLogEntry>>({
    queryKey: [
      ...PLATFORM_AUDIT_LOG_QUERY_KEY,
      aggregateType ?? "ALL",
      search,
      createdFrom,
      createdTo,
      scope.actorId ?? "",
      scope.aggregateId ?? "",
      page,
      size,
    ],
    queryFn: () =>
      listPlatformAuditLogs(
        apiClient,
        aggregateType,
        page,
        size,
        search,
        createdFrom || undefined,
        createdTo || undefined,
        scope,
      ),
    select: (logs) => {
      const byId = new Map((actors.data ?? []).map((actor) => [actor.publicId, actor.fullName]));
      return {
        ...logs,
        data: logs.data.map((log) => ({
          log,
          actorName: byId.get(log.actorUserId) ?? null,
        })),
      };
    },
    placeholderData: keepPreviousData,
  });
}

/** One entry with its before/after snapshots; idle until an entry is chosen. */
export function usePlatformAuditEntry(
  publicId: string | null,
): UseQueryResult<AuditLogDetailResponse> {
  return useQuery({
    queryKey: [...PLATFORM_AUDIT_ENTRY_QUERY_KEY, publicId],
    queryFn: () => getPlatformAuditLog(apiClient, publicId ?? ""),
    enabled: publicId !== null,
  });
}
