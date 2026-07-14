import type { ApiClient } from "../../client/client";
import type { CreateHostRequest, HostResponse } from "../../types/host";

export const ADMIN_HOST_ENDPOINTS = {
  hosts: "/api/v1/admin/hosts",
} as const;

export function createHost(
  client: ApiClient,
  payload: CreateHostRequest,
): Promise<HostResponse> {
  return client.request<HostResponse>(ADMIN_HOST_ENDPOINTS.hosts, {
    method: "POST",
    body: payload,
  });
}
