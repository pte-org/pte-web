"use client";

import { getHostDashboard, type HostDashboardResponse } from "@pte/api-client";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { HOST_DASHBOARD_QUERY_KEY, HOST_DASHBOARD_STALE_TIME_MS } from "./constants";

/**
 * The only request behind the overview: one aggregate with independent sections. The backend
 * default window applies (no `windowDays` is sent). Failures are shown through the user-facing
 * error helper by the view, never as raw messages; no automatic retry so the error state
 * appears at once and the retry button is the single way to ask again.
 */
export function useHostDashboard(): UseQueryResult<HostDashboardResponse> {
  return useQuery({
    queryKey: HOST_DASHBOARD_QUERY_KEY,
    queryFn: () => getHostDashboard(apiClient),
    staleTime: HOST_DASHBOARD_STALE_TIME_MS,
    retry: false,
  });
}
