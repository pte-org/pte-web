"use client";

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { usePollingInterval } from "./hooks/usePollingInterval";
import {
  POLL_INTERVAL_MS,
  PROCTOR_LIVE_ATTEMPTS_QUERY_KEY,
} from "./constants";
import type { ProctorLiveAttempt } from "./types";

/**
 * Live attempt list for a single session.
 *
 * STUB: the backend endpoint `GET /api/v1/exam-sessions/{id}/attempts`
 * does not exist on `hung/fix-ui-first`. We return `[]` so the view
 * renders with a clean empty state. When the endpoint ships, replace
 * the `queryFn` body with a real fetch (no caller-side changes
 * required).
 */
export function useProctorLiveAttempts(
  sessionPublicId: string,
): UseQueryResult<ProctorLiveAttempt[]> {
  const { refetchInterval, refetchIntervalInBackground } = usePollingInterval({
    intervalMs: POLL_INTERVAL_MS,
  });
  return useQuery<ProctorLiveAttempt[]>({
    queryKey: [...PROCTOR_LIVE_ATTEMPTS_QUERY_KEY, sessionPublicId],
    enabled: sessionPublicId.length > 0,
    refetchInterval,
    refetchIntervalInBackground,
    queryFn: async () => [] as ProctorLiveAttempt[],
  });
}