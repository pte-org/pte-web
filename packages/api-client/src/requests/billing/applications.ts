import type { ApiClient } from "../../client/client";
import type {
  RejectApplicationRequest,
  SubmitApplicationRequest,
  TenantApplicationResponse,
} from "../../types/billing";

export const APPLICATION_ENDPOINTS = {
  applications: "/api/v1/applications",
  detail: (publicId: string) => "/api/v1/applications/" + publicId,
  status: (publicId: string) => "/api/v1/applications/" + publicId + "/status",
} as const;

export function submitApplication(
  client: ApiClient,
  payload: SubmitApplicationRequest,
): Promise<void> {
  return client.request(APPLICATION_ENDPOINTS.applications, { method: "POST", body: payload });
}

export function listApplications(client: ApiClient): Promise<TenantApplicationResponse[]> {
  return client.request(APPLICATION_ENDPOINTS.applications);
}

export function getApplication(
  client: ApiClient,
  publicId: string,
): Promise<TenantApplicationResponse> {
  return client.request(APPLICATION_ENDPOINTS.detail(publicId));
}

export function approveApplication(
  client: ApiClient,
  publicId: string,
): Promise<void> {
  return client.request(APPLICATION_ENDPOINTS.status(publicId), { method: "PATCH", body: { action: "APPROVE" }, });
}

export function rejectApplication(
  client: ApiClient,
  publicId: string,
  payload: RejectApplicationRequest,
): Promise<TenantApplicationResponse> {
  return client.request(APPLICATION_ENDPOINTS.status(publicId), {
    method: "PATCH", body: { action: "REJECT", ...payload },
  });
}
