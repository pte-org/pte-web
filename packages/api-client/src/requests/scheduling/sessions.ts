import type { ApiClient } from "../../client/client";
import type { CreateSessionRequest, SessionResponse } from "../../types/scheduling";

export const SESSION_ENDPOINTS = {
  sessions: "/api/scheduling/sessions",
  session: (publicId: string) => `/api/scheduling/sessions/${publicId}`,
  open: (publicId: string) => `/api/scheduling/sessions/${publicId}/open`,
  close: (publicId: string) => `/api/scheduling/sessions/${publicId}/close`,
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

export function listSessions(client: ApiClient): Promise<SessionResponse[]> {
  return client.request<SessionResponse[]>(SESSION_ENDPOINTS.sessions);
}

export function getSession(
  client: ApiClient,
  publicId: string,
): Promise<SessionResponse> {
  return client.request<SessionResponse>(SESSION_ENDPOINTS.session(publicId));
}

export function openSession(
  client: ApiClient,
  publicId: string,
): Promise<SessionResponse> {
  return client.request<SessionResponse>(SESSION_ENDPOINTS.open(publicId), {
    method: "POST",
  });
}

export function closeSession(
  client: ApiClient,
  publicId: string,
): Promise<SessionResponse> {
  return client.request<SessionResponse>(SESSION_ENDPOINTS.close(publicId), {
    method: "POST",
  });
}
