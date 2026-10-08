"use client";

import {
  useInfiniteQuery,
  useQuery,
  type UseInfiniteQueryResult,
  type UseQueryResult,
} from "@tanstack/react-query";
import type { InfiniteData } from "@tanstack/react-query";
import { usePollingInterval } from "./hooks/usePollingInterval";
import {
  POLL_INTERVAL_MS,
  PROCTOR_AUDIT_LOG_QUERY_KEY,
  PROCTOR_AUDIT_SECURITY_QUERY_KEY,
  PROCTOR_LIVE_ATTEMPTS_QUERY_KEY,
} from "./constants";
import type {
  ProctorAuditLogEntry,
  ProctorLiveAttempt,
  ProctorSecurityAuditEntry,
} from "./types";

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

export interface ProctorAuditLogPage {
  items: ProctorAuditLogEntry[];
  page: number;
  size: number;
  totalPages: number;
  totalItems: number;
}

/**
 * Proctor audit log for a single session.
 *
 * STUB: the backend endpoint `GET /api/v1/proctor/audit?...` does not
 * exist on `hung/fix-ui-first`. We return an empty page so the view
 * renders a clean empty state. When the endpoint ships, replace the
 * `queryFn` body with a real fetch.
 */
export function useProctorAuditLog(
  sessionPublicId: string,
): UseQueryResult<ProctorAuditLogPage> {
  return useQuery<ProctorAuditLogPage>({
    queryKey: [...PROCTOR_AUDIT_LOG_QUERY_KEY, sessionPublicId],
    enabled: sessionPublicId.length > 0,
    queryFn: async () => ({
      items: [] as ProctorAuditLogEntry[],
      page: 0,
      size: 20,
      totalPages: 0,
      totalItems: 0,
    }),
  });
}

export interface ProctorSecurityAuditPage {
  items: ProctorSecurityAuditEntry[];
  cursor: string | null;
  hasNext: boolean;
}

/**
 * Cursor-paginated security audit feed for a single session.
 *
 * STUB: the backend endpoint does not exist on `hung/fix-ui-first`.
 * We return an empty first page with `hasNext: false`, so the
 * "Load more" button is permanently disabled. When the endpoint
 * ships, replace the `queryFn` body and `getNextPageParam` to
 * read `cursor` from the response and forward it on subsequent
 * pages.
 */
export function useProctorSecurityAudit(
  sessionPublicId: string,
  limit = 20,
): UseInfiniteQueryResult<InfiniteData<ProctorSecurityAuditPage, unknown>> {
  return useInfiniteQuery<ProctorSecurityAuditPage>({
    queryKey: [...PROCTOR_AUDIT_SECURITY_QUERY_KEY, sessionPublicId, limit],
    initialPageParam: undefined as string | undefined,
    queryFn: async () => ({
      items: [] as ProctorSecurityAuditEntry[],
      cursor: null,
      hasNext: false,
    }),
    getNextPageParam: () => undefined,
    enabled: sessionPublicId.length > 0,
  });
}