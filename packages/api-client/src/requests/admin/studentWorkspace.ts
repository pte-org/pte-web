import type { ApiClient, PagedResult } from "../../client/client";
import type {
  StudentAttemptHistoryPage,
  StudentDetailResponse,
  StudentHistoryQuery,
  StudentPerformanceResponse,
} from "../../types/admin/studentWorkspace";

export const STUDENT_WORKSPACE_ENDPOINTS = {
  students: "/api/v1/students",
  detail: (publicId: string) => `/api/v1/students/${encodeURIComponent(publicId)}`,
  attempts: (publicId: string) => `/api/v1/students/${encodeURIComponent(publicId)}/attempts`,
  performance: (publicId: string) => `/api/v1/students/${encodeURIComponent(publicId)}/performance`,
} as const;

function queryString(query: StudentHistoryQuery): string {
  const params = new URLSearchParams({ page: String(query.page), size: String(query.size) });
  if (query.from) params.set("from", query.from);
  if (query.to) params.set("to", query.to);
  if (query.status && query.status !== "ALL") params.set("status", query.status);
  return params.toString();
}

export function getStudentDetail(
  client: ApiClient,
  publicId: string,
): Promise<StudentDetailResponse> {
  return client.request<StudentDetailResponse>(STUDENT_WORKSPACE_ENDPOINTS.detail(publicId));
}

export function listStudentAttempts(
  client: ApiClient,
  publicId: string,
  query: StudentHistoryQuery,
): Promise<StudentAttemptHistoryPage> {
  return client.request<PagedResult<StudentAttemptHistoryPage["data"][number]>>(
    `${STUDENT_WORKSPACE_ENDPOINTS.attempts(publicId)}?${queryString(query)}`,
  );
}

export function getStudentPerformance(
  client: ApiClient,
  publicId: string,
  query: Pick<StudentHistoryQuery, "from" | "to"> = {},
): Promise<StudentPerformanceResponse> {
  const params = new URLSearchParams();
  if (query.from) params.set("from", query.from);
  if (query.to) params.set("to", query.to);
  const suffix = params.toString() ? `?${params.toString()}` : "";
  return client.request<StudentPerformanceResponse>(
    `${STUDENT_WORKSPACE_ENDPOINTS.performance(publicId)}${suffix}`,
  );
}
