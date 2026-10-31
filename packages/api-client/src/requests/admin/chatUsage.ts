import type { ApiClient } from "../../client/client";
import type { ChatStudentUsageResponse, ChatUsageDayResponse } from "../../types/admin/chatUsage";

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

/** Platform admins only. The students with the most messages in the range, most active first; ids and counts only. */
export function getChatTopStudents(
  client: ApiClient,
  from: string,
  to: string,
  limit?: number,
): Promise<ChatStudentUsageResponse[]> {
  const params = new URLSearchParams({ from, to });
  if (limit !== undefined) params.set("limit", String(limit));
  return client.request<ChatStudentUsageResponse[]>(`${CHAT_USAGE_ENDPOINT}/students?${params.toString()}`);
}
