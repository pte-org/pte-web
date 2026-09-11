"use client";

import { listAuditLogs, listUsers, type AuditLogResponse, type UserResponse } from "@pte/api-client";
import { useQuery, useQueryClient, type UseQueryResult } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { TENANT_USERS_QUERY_KEY } from "@/features/exams/constants";
import { AUDIT_LOGS_QUERY_KEY } from "../constants";

export interface AuditLogEntry {
  log: AuditLogResponse;
  actorName: string | null;
}

/**
 * Same `queryKey`+`queryFn` as `useTenantStudents`/`useTenantLecturers`/
 * `useTenantCoordinators` (unfiltered here, since an audit log actor can be
 * any role, not just one) — shares the one `GET /users` cache entry rather
 * than issuing a separate fetch.
 */
function useAllTenantUsers(): UseQueryResult<UserResponse[]> {
  return useQuery({
    queryKey: TENANT_USERS_QUERY_KEY,
    queryFn: () => listUsers(apiClient),
  });
}

/**
 * The tenant's audit trail, optionally filtered by aggregate type, joined
 * client-side against the tenant's users so each row shows the actor's name
 * — `AuditLogResponse` only carries `actorUserId` (same join-here-not-in-
 * admin reasoning as `useClassRoster`/`useProgramRoster`).
 */
export function useAuditLogs(aggregateType?: string): UseQueryResult<AuditLogEntry[]> {
  const users = useAllTenantUsers();
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: [...AUDIT_LOGS_QUERY_KEY, aggregateType ?? "ALL"],
    queryFn: async () => {
      const logs = await listAuditLogs(apiClient, aggregateType);
      const allUsers = queryClient.getQueryData<UserResponse[]>(TENANT_USERS_QUERY_KEY) ?? users.data ?? [];
      const byId = new Map(allUsers.map((user) => [user.publicId, user]));
      return logs.map((log) => ({ log, actorName: byId.get(log.actorUserId)?.fullName ?? null }));
    },
    enabled: users.data !== undefined,
  });
}
