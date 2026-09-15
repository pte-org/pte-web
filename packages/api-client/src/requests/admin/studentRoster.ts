import type { ApiClient, PagedResult } from "../../client/client";
import type { StudentRosterQuery, StudentRosterRow } from "../../types/admin/studentRoster";

export const STUDENT_ROSTER_ENDPOINTS = {
  roster: "/api/admin/student-roster",
} as const;

function queryString(query: StudentRosterQuery): string {
  const params = new URLSearchParams();
  params.set("page", String(query.page));
  params.set("size", String(query.size));
  if (query.search?.trim()) params.set("search", query.search.trim());
  if (query.programPublicId) params.set("programPublicId", query.programPublicId);
  if (query.classPublicId) params.set("classPublicId", query.classPublicId);
  if (query.assignmentStatus) params.set("assignmentStatus", query.assignmentStatus);
  if (query.sort) params.set("sort", query.sort);
  if (query.direction) params.set("direction", query.direction);
  return params.toString();
}

export function listStudentRoster(
  client: ApiClient,
  query: StudentRosterQuery,
): Promise<PagedResult<StudentRosterRow>> {
  return client.request<PagedResult<StudentRosterRow>>(
    `${STUDENT_ROSTER_ENDPOINTS.roster}?${queryString(query)}`,
  );
}
