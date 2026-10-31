"use client";

import { getChatUsage, type ChatUsageDayResponse } from "@pte/api-client";
import { keepPreviousData, useQuery, type UseQueryResult } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { CHAT_USAGE_QUERY_KEY } from "./constants";

export function useChatUsage(from: string, to: string): UseQueryResult<ChatUsageDayResponse[]> {
  return useQuery({
    queryKey: [...CHAT_USAGE_QUERY_KEY, from, to],
    queryFn: () => getChatUsage(apiClient, from, to),
    // Both dates are needed: an incomplete range is not a request the server accepts.
    enabled: Boolean(from) && Boolean(to),
    placeholderData: keepPreviousData,
  });
}
