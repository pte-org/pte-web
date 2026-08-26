import type { ApiClient } from "../../client/client";
import type { CreateUserRequest, ResetPasswordRequest, UserResponse } from "../../types/user";

export const USER_ENDPOINTS = {
  users: "/api/iam/users",
  byTenant: (tenantPublicId: string) => `/api/iam/users/by-tenant/${tenantPublicId}`,
  resetPassword: (publicId: string) => `/api/iam/users/${publicId}/reset-password`,
} as const;

export function createUser(client: ApiClient, payload: CreateUserRequest): Promise<UserResponse> {
  return client.request<UserResponse>(USER_ENDPOINTS.users, {
    method: "POST",
    body: payload,
  });
}

export function listUsersByTenant(client: ApiClient, tenantPublicId: string): Promise<UserResponse[]> {
  return client.request<UserResponse[]>(USER_ENDPOINTS.byTenant(tenantPublicId));
}

export function resetPassword(
  client: ApiClient,
  publicId: string,
  payload: ResetPasswordRequest,
): Promise<UserResponse> {
  return client.request<UserResponse>(USER_ENDPOINTS.resetPassword(publicId), {
    method: "POST",
    body: payload,
  });
}
