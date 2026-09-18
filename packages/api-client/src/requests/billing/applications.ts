import type { ApiClient } from "../../client/client";
import type {
  RejectApplicationRequest,
  SubmitApplicationRequest,
  TenantApplicationResponse,
} from "../../types/billing";

export const APPLICATION_ENDPOINTS = {
  applications: "/api/v1/applications",
  approve: (publicId: string) => "/api/v1/applications/" + publicId + "/approval",
  reject: (publicId: string) => "/api/v1/applications/" + publicId + "/rejection",
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

export function approveApplication(
  client: ApiClient,
  publicId: string,
): Promise<void> {
  return client.request(APPLICATION_ENDPOINTS.approve(publicId), { method: "POST" });
}

export function rejectApplication(
  client: ApiClient,
  publicId: string,
  payload: RejectApplicationRequest,
): Promise<TenantApplicationResponse> {
  return client.request(APPLICATION_ENDPOINTS.reject(publicId), {
    method: "POST",
    body: payload,
  });
}
