"use client";

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { getAttemptReport, type ReportResponse } from "@pte/api-client";
import { apiClient } from "@/lib/apiClient";
import { ATTEMPT_REPORT_QUERY_KEY } from "../constants/attemptReviews";

/** The overall and per-skill scores of one attempt; live until the host publishes the session. */
export function useAttemptReport(attemptPublicId: string): UseQueryResult<ReportResponse> {
  return useQuery({
    queryKey: [...ATTEMPT_REPORT_QUERY_KEY, attemptPublicId],
    queryFn: () => getAttemptReport(apiClient, attemptPublicId),
    enabled: attemptPublicId.length > 0,
  });
}
