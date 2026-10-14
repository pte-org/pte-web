import type { ApiClient } from "../../client/client";
import type {
  ExamStaffAccountResponse,
  ExaminerSessionPage,
  ProctorSessionPage,
  StaffOverviewResponse,
  StaffWorkspaceQuery,
  UpdateExamStaffProfileRequest,
} from "../../types/admin/examStaffWorkspace";

const staffPath = (publicId: string): string =>
  `/api/v1/exam-staff/${encodeURIComponent(publicId)}`;

export const EXAM_STAFF_WORKSPACE_ENDPOINTS = {
  detail: staffPath,
  overview: (id: string) => `${staffPath(id)}/overview`,
  proctor: (id: string) => `${staffPath(id)}/proctor-sessions`,
  examiner: (id: string) => `${staffPath(id)}/examiner-sessions`,
  profile: (id: string) => `/api/v1/users/${encodeURIComponent(id)}/exam-staff-profile`,
} as const;

/** Filters and totals belong to the server, including each independent board page. */
export const staffWorkspaceQueryString = (query: StaffWorkspaceQuery): string => {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== "" && value !== "ALL") {
      params.set(key, String(value));
    }
  });
  const serialized = params.toString();
  return serialized ? `?${serialized}` : "";
};

export const getExamStaffDetail = (
  client: ApiClient, publicId: string, signal?: AbortSignal,
): Promise<ExamStaffAccountResponse> =>
  client.request(EXAM_STAFF_WORKSPACE_ENDPOINTS.detail(publicId), { signal });

export const getExamStaffOverview = (
  client: ApiClient, publicId: string, query: StaffWorkspaceQuery, signal?: AbortSignal,
): Promise<StaffOverviewResponse> =>
  client.request(
    `${EXAM_STAFF_WORKSPACE_ENDPOINTS.overview(publicId)}${staffWorkspaceQueryString(query)}`,
    { signal },
  );

export const listProctorStaffSessions = (
  client: ApiClient, publicId: string, query: StaffWorkspaceQuery, signal?: AbortSignal,
): Promise<ProctorSessionPage> =>
  client.request(
    `${EXAM_STAFF_WORKSPACE_ENDPOINTS.proctor(publicId)}${staffWorkspaceQueryString(query)}`,
    { signal },
  );

export const listExaminerStaffSessions = (
  client: ApiClient, publicId: string, query: StaffWorkspaceQuery, signal?: AbortSignal,
): Promise<ExaminerSessionPage> =>
  client.request(
    `${EXAM_STAFF_WORKSPACE_ENDPOINTS.examiner(publicId)}${staffWorkspaceQueryString(query)}`,
    { signal },
  );

export const updateExamStaffProfile = (
  client: ApiClient, publicId: string, payload: UpdateExamStaffProfileRequest,
): Promise<ExamStaffAccountResponse> =>
  client.request(EXAM_STAFF_WORKSPACE_ENDPOINTS.profile(publicId), { method: "PATCH", body: payload });
