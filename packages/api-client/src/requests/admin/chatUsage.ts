import type { ApiClient } from "../../client/client";
import type { ChatUsageDayResponse } from "../../types/admin/chatUsage";

export const CHAT_USAGE_ENDPOINT = "/api/v1/admin/chat/usage";

/** Platform admins only. One entry per day from `from` to `to` (yyyy-MM-dd), days without traffic included. */
export function getChatUsage(
  client: ApiClient,
  from: string,
  to: string,
): Promise<ChatUsageDayResponse[]> {
  const params = new URLSearchParams({ from, to });
  return client.request<ChatUsageDayResponse[]>(`${CHAT_USAGE_ENDPOINT}?${params.toString()}`);
}
