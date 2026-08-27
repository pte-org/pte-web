import type { ApiClient } from "../../client/client";
import type {
  BulkCreateUsersRequest,
  BulkCreateUsersResponse,
  CreateUserRequest,
  ResetPasswordRequest,
  UserResponse,
} from "../../types/user";

export const USER_ENDPOINTS = {
  users: "/api/iam/users",
  bulk: "/api/iam/users/bulk",
  byTenant: (tenantPublicId: string) => `/api/iam/users/by-tenant/${tenantPublicId}`,
  resetPassword: (publicId: string) => `/api/iam/users/${publicId}/reset-password`,
} as const;

export function createUser(client: ApiClient, payload: CreateUserRequest): Promise<UserResponse> {
  return client.request<UserResponse>(USER_ENDPOINTS.users, {
    method: "POST",
    body: payload,
  });
}

export function bulkCreateUsers(
  client: ApiClient,
  payload: BulkCreateUsersRequest,
): Promise<BulkCreateUsersResponse> {
  return client.request<BulkCreateUsersResponse>(USER_ENDPOINTS.bulk, {
    method: "POST",
    body: payload,
  });
}

/**
 * Caller-tenant-scoped (`GET /users` → `UserService.listByTenant`, reads
 * the caller's own JWT tenant claim) — NOT `listUsersByTenant`
 * (`GET /users/by-tenant/{tenantId}`) below, which is `PLATFORM_ADMIN`-only
 * and would 403 for a `HOST_ADMIN` caller. Use this one for any
 * Host-facing "list my tenant's users" need.
 */
export function listUsers(client: ApiClient): Promise<UserResponse[]> {
  return client.request<UserResponse[]>(USER_ENDPOINTS.users);
}

/** Platform-admin-only — see `listUsers` above for the Host-facing equivalent. */
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
