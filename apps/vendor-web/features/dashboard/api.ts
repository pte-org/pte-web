"use client";

import { getAdminDashboard, type AdminDashboardResponse } from "@pte/api-client";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { ADMIN_DASHBOARD_QUERY_KEY, ADMIN_DASHBOARD_STALE_TIME_MS } from "./constants";

/**
 * The only request behind the platform admin overview: one aggregate with independent sections.
 * The backend default window (30 days) applies. Failures are shown through the error state
 * by the view; no automatic retry so the error state appears immediately and retry is explicit.
 */
export function useAdminDashboard(): UseQueryResult<AdminDashboardResponse> {
  return useQuery({
    queryKey: ADMIN_DASHBOARD_QUERY_KEY,
    queryFn: () => getAdminDashboard(apiClient),
    staleTime: ADMIN_DASHBOARD_STALE_TIME_MS,
    retry: false,
  });
}
