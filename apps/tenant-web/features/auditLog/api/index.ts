"use client";

import {
  DEFAULT_PAGE_SIZE,
  listAuditLogs,
  listUserDirectory,
  type AuditLogResponse,
  type PagedResult,
  type UserDirectoryEntryResponse,
} from "@pte/api-client";
import {
  keepPreviousData,
  useQuery,
  useQueryClient,
  type UseQueryResult,
} from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { AUDIT_LOGS_QUERY_KEY, AUDIT_LOG_ACTORS_QUERY_KEY } from "../constants";

export interface AuditLogEntry {
  log: AuditLogResponse;
  actorName: string | null;
}

/**
 * Every user in the tenant, unfiltered — deliberately NOT `useTenantStudents`/
 * `listUsers`'s `TENANT_USERS_QUERY_KEY` cache. That endpoint only returns users the
 * caller (a HOST_ADMIN) may *manage*, which excludes HOST_ADMIN accounts entirely —
 * joining against it made every admin-performed audit entry resolve to no actor name
 * at all. This hits `GET /users/directory` instead, which has no such filter.
 */
function useAuditActorDirectory(): UseQueryResult<UserDirectoryEntryResponse[]> {
  return useQuery({
    queryKey: AUDIT_LOG_ACTORS_QUERY_KEY,
    queryFn: () => listUserDirectory(apiClient),
  });
}

/**
 * The tenant's audit trail, optionally filtered by aggregate type, joined
 * client-side against the tenant's user directory so each row shows the
 * actor's name — `AuditLogResponse` only carries `actorUserId`.
 */
export function useAuditLogs(
  aggregateType?: string,
  page = 0,
  size = DEFAULT_PAGE_SIZE,
): UseQueryResult<PagedResult<AuditLogEntry>> {
  const actors = useAuditActorDirectory();
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: [...AUDIT_LOGS_QUERY_KEY, aggregateType ?? "ALL", page, size],
    queryFn: async () => {
      const logs = await listAuditLogs(apiClient, aggregateType, page, size);
      const allActors =
        queryClient.getQueryData<UserDirectoryEntryResponse[]>(AUDIT_LOG_ACTORS_QUERY_KEY) ??
        actors.data ??
        [];
      const byId = new Map(allActors.map((actor) => [actor.publicId, actor]));
      return {
        ...logs,
        data: logs.data.map((log) => ({
          log,
          actorName: byId.get(log.actorUserId)?.fullName ?? null,
        })),
      };
    },
    enabled: actors.data !== undefined,
    placeholderData: keepPreviousData,
  });
}
