import type {
  CreateIncidentRequest,
  IncidentHistoryItemResponse,
  IncidentPageResponse,
  IncidentResponse,
  UpdateIncidentStatusRequest,
} from "../types/incidents";
import type { ApiClient } from "../client/client";

export const INCIDENT_ENDPOINTS = {
  list: (sessionPublicId: string) =>
    `/api/v1/exam-sessions/${encodeURIComponent(sessionPublicId)}/incidents`,
  create: (sessionPublicId: string) =>
    `/api/v1/exam-sessions/${encodeURIComponent(sessionPublicId)}/incidents`,
  detail: (sessionPublicId: string, incidentPublicId: string) =>
    `/api/v1/exam-sessions/${encodeURIComponent(sessionPublicId)}/incidents/${encodeURIComponent(incidentPublicId)}`,
  history: (sessionPublicId: string, incidentPublicId: string) =>
    `/api/v1/exam-sessions/${encodeURIComponent(sessionPublicId)}/incidents/${encodeURIComponent(incidentPublicId)}/history`,
  updateStatus: (sessionPublicId: string, incidentPublicId: string) =>
    `/api/v1/exam-sessions/${encodeURIComponent(sessionPublicId)}/incidents/${encodeURIComponent(incidentPublicId)}/status`,
};

export function createIncident(
  client: ApiClient,
  sessionPublicId: string,
  request: CreateIncidentRequest,
): Promise<IncidentResponse> {
  return client.request<IncidentResponse>(INCIDENT_ENDPOINTS.create(sessionPublicId), {
    method: "POST",
    body: request,
  });
}

export function listIncidents(
  client: ApiClient,
  sessionPublicId: string,
  params?: { status?: string; page?: number; size?: number },
): Promise<IncidentPageResponse> {
  const query = new URLSearchParams();
  if (params?.status && params.status !== "ALL") query.set("status", params.status);
  if (params?.page !== undefined) query.set("page", String(params.page));
  if (params?.size !== undefined) query.set("size", String(params.size));
  const qs = query.toString();
  const url = `${INCIDENT_ENDPOINTS.list(sessionPublicId)}${qs ? `?${qs}` : ""}`;
  return client.request<IncidentPageResponse>(url);
}

export function getIncident(
  client: ApiClient,
  sessionPublicId: string,
  incidentPublicId: string,
): Promise<IncidentResponse> {
  return client.request<IncidentResponse>(
    INCIDENT_ENDPOINTS.detail(sessionPublicId, incidentPublicId),
  );
}

export function getIncidentHistory(
  client: ApiClient,
  sessionPublicId: string,
  incidentPublicId: string,
): Promise<IncidentHistoryItemResponse[]> {
  return client.request<IncidentHistoryItemResponse[]>(
    INCIDENT_ENDPOINTS.history(sessionPublicId, incidentPublicId),
  );
}

export function updateIncidentStatus(
  client: ApiClient,
  sessionPublicId: string,
  incidentPublicId: string,
  request: UpdateIncidentStatusRequest,
): Promise<IncidentResponse> {
  return client.request<IncidentResponse>(
    INCIDENT_ENDPOINTS.updateStatus(sessionPublicId, incidentPublicId),
    {
      method: "PATCH",
      body: request,
    },
  );
}
