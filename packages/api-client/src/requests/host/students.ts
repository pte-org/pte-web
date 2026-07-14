import type { ApiClient, PagedResult } from "../../client/client";
import type { HostStudentResponse } from "../../types/host/student";

export interface HostStudentListParams {
  page?: number;
  size?: number;
}

export const HOST_STUDENT_ENDPOINTS = {
  list: "/api/v1/host/students",
} as const;

function toQueryString(params: HostStudentListParams = {}): string {
  const searchParams = new URLSearchParams();
  if (params.page !== undefined) searchParams.set("page", String(params.page));
  if (params.size !== undefined) searchParams.set("size", String(params.size));

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

export function listHostStudents(
  client: ApiClient,
  params?: HostStudentListParams,
): Promise<PagedResult<HostStudentResponse>> {
  return client.request<PagedResult<HostStudentResponse>>(
    `${HOST_STUDENT_ENDPOINTS.list}${toQueryString(params)}`,
  );
}
