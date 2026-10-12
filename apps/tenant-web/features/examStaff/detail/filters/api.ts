"use client";

import { listSessions, type SessionResponse } from "@pte/api-client";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { useCurrentUser } from "@/features/auth/api";
import { apiClient } from "@/lib/apiClient";

/** Existing tenant catalog is only an option source, never a workload/count source. */
export const useStaffSessionOptions = (enabled: boolean): UseQueryResult<SessionResponse[]> => {
  const { data: user } = useCurrentUser();
  return useQuery({
    queryKey: ["examStaff", "sessionOptions", user?.tenantId ?? ""],
    enabled: enabled && Boolean(user?.tenantId && user.roles.includes("HOST_ADMIN")),
    queryFn: ({ signal }) => listSessions(apiClient, signal),
  });
};
