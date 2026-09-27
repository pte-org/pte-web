"use client";

import { listMyReports, type ReportResponse } from "@pte/api-client";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";

export const MY_REPORTS_QUERY_KEY = ["myPublishedReports"] as const;

export function useMyReports(): UseQueryResult<ReportResponse[]> {
  return useQuery({
    queryKey: MY_REPORTS_QUERY_KEY,
    queryFn: () => listMyReports(apiClient),
  });
}
