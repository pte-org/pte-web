"use client";

import {
  DEFAULT_PAGE_SIZE,
  listPlatformAuditActors,
  listPlatformAuditLogs,
  type AuditLogResponse,
  type PagedResult,
  type UserDirectoryEntryResponse,
} from "@pte/api-client";
import { keepPreviousData, useQuery, type UseQueryResult } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { PLATFORM_AUDIT_ACTORS_QUERY_KEY, PLATFORM_AUDIT_LOG_QUERY_KEY } from "./constants";

export interface PlatformAuditLogEntry {
  log: AuditLogResponse;
  actorName: string | null;
}

function usePlatformAuditActors(): UseQueryResult<UserDirectoryEntryResponse[]> {
  return useQuery({
    queryKey: PLATFORM_AUDIT_ACTORS_QUERY_KEY,
    queryFn: () => listPlatformAuditActors(apiClient),
    staleTime: 60_000,
  });
}

export function usePlatformAuditLogs(
  aggregateType?: string,
  page = 0,
  size = DEFAULT_PAGE_SIZE,
  search = "",
  createdFrom = "",
  createdTo = "",
): UseQueryResult<PagedResult<PlatformAuditLogEntry>> {
  const actors = usePlatformAuditActors();

  return useQuery<PagedResult<AuditLogResponse>, Error, PagedResult<PlatformAuditLogEntry>>({
    queryKey: [
      ...PLATFORM_AUDIT_LOG_QUERY_KEY,
      aggregateType ?? "ALL",
      search,
      createdFrom,
      createdTo,
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
