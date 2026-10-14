import type { ApiClient } from "../../client/client";
import type {
  CreateSessionRequest,
  ExamPreviewResponse,
  ExamPolicyResponse,
  PatchExamPolicyRequest,
  PatchExamScheduleRequest,
  SessionResponse,
} from "../../types/scheduling";

/** Matches `SessionController`'s `@RequestMapping("/api/v1/sessions")` — see requests/question/index.ts's identical note. */
export const SESSION_ENDPOINTS = {
  sessions: "/api/v1/sessions",
  session: (publicId: string) => `/api/v1/sessions/${publicId}`,
  examPreview: (publicId: string) => `/api/v1/sessions/${publicId}/exam-preview`,
  policy: (publicId: string) => `/api/v1/sessions/${publicId}/policy`,
  schedule: (publicId: string) => `/api/v1/sessions/${publicId}/schedule`,
  open: (publicId: string) => `/api/v1/sessions/${publicId}/open`,
  close: (publicId: string) => `/api/v1/sessions/${publicId}/close`,
} as const;

export function createSession(
  client: ApiClient,
  payload: CreateSessionRequest,
): Promise<SessionResponse> {
  return client.request<SessionResponse>(SESSION_ENDPOINTS.sessions, {
    method: "POST",
    body: payload,
  });
}

export function listSessions(client: ApiClient, signal?: AbortSignal): Promise<SessionResponse[]> {
  return client.request<SessionResponse[]>(SESSION_ENDPOINTS.sessions, { signal });
}

export function getSession(client: ApiClient, publicId: string): Promise<SessionResponse> {
  return client.request<SessionResponse>(SESSION_ENDPOINTS.session(publicId));
}

export function patchExamPolicy(
  client: ApiClient,
  publicId: string,
  payload: PatchExamPolicyRequest,
): Promise<ExamPolicyResponse> {
  return client.request<ExamPolicyResponse>(SESSION_ENDPOINTS.policy(publicId), {
    method: "PATCH",
    body: payload,
  });
}

export function patchExamSchedule(
  client: ApiClient,
  publicId: string,
  payload: PatchExamScheduleRequest,
): Promise<SessionResponse> {
  return client.request<SessionResponse>(SESSION_ENDPOINTS.schedule(publicId), {
    method: "PATCH",
    body: payload,
  });
}

export function deleteSession(client: ApiClient, publicId: string): Promise<void> {
  return client.request<void>(SESSION_ENDPOINTS.session(publicId), {
    method: "DELETE",
  });
}

export function getSessionExamPreview(
  client: ApiClient,
  publicId: string,
): Promise<ExamPreviewResponse> {
  return client.request<ExamPreviewResponse>(SESSION_ENDPOINTS.examPreview(publicId));
}

export function openSession(client: ApiClient, publicId: string): Promise<SessionResponse> {
  return client.request<SessionResponse>(SESSION_ENDPOINTS.open(publicId), {
    method: "POST",
  });
}

export function closeSession(client: ApiClient, publicId: string): Promise<SessionResponse> {
  return client.request<SessionResponse>(SESSION_ENDPOINTS.close(publicId), {
    method: "POST",
  });
}
