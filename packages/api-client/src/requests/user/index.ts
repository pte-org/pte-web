import type { ApiClient, PagedResult } from "../../client/client";
import type {
  BulkCreateUsersRequest,
  BulkCreateUsersResponse,
  CreateUserRequest,
  ExamStaffPage,
  ExamStaffQuery,
  GeneratedCredentialsResponse,
  ResetPasswordRequest,
  UserResponse,
} from "../../types/user";

export const USER_ENDPOINTS = {
  users: "/api/v1/users",
  bulk: "/api/v1/users/bulk",
  byTenant: (tenantPublicId: string) => `/api/v1/users/by-tenant/${tenantPublicId}`,
  suspend: (publicId: string) => `/api/v1/users/${publicId}/suspend`,
  reactivate: (publicId: string) => `/api/v1/users/${publicId}/reactivate`,
  resetPassword: (publicId: string) => `/api/v1/users/${publicId}/reset-password`,
  sendCredentialsEmail: (publicId: string) => `/api/v1/users/${publicId}/credentials/send-email`,
  generateCredentials: (publicId: string) => `/api/v1/users/${publicId}/credentials/generate`,
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

export function listExamStaff(client: ApiClient, query: ExamStaffQuery): Promise<ExamStaffPage> {
  const params = new URLSearchParams({
    page: String(query.page),
    size: String(query.size),
    role: query.role ?? "ALL",
    status: query.status ?? "ALL",
    sort: query.sort ?? "CREATED_AT",
    direction: query.direction ?? "DESC",
  });
  if (query.search?.trim()) {
    params.set("search", query.search.trim());
  }
  return client.request<PagedResult<UserResponse>>(`${USER_ENDPOINTS.users}/exam-staff?${params}`);
}

/** Reads every bounded server page for a caller who needs the complete staff selector. */
export async function listAllExamStaff(
  client: ApiClient,
  query: Omit<ExamStaffQuery, "page">,
): Promise<UserResponse[]> {
  const firstPage = await listExamStaff(client, { ...query, page: 0 });
  const users = [...firstPage.data];
  for (let page = 1; page < firstPage.meta.totalPages; page += 1) {
    const result = await listExamStaff(client, { ...query, page });
    users.push(...result.data);
  }
  return users;
}

/** Platform-admin-only — see `listUsers` above for the Host-facing equivalent. */
export function listUsersByTenant(
  client: ApiClient,
  tenantPublicId: string,
): Promise<UserResponse[]> {
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

/** Rotates the password server-side and queues a one-time credential email. */
export function sendCredentialsEmail(
  client: ApiClient,
  publicId: string,
): Promise<GeneratedCredentialsResponse> {
  return client.request<GeneratedCredentialsResponse>(
    USER_ENDPOINTS.sendCredentialsEmail(publicId),
    {
      method: "POST",
    },
  );
}

/** Rotates a Student password for Host verification without sending email. */
export function generateStudentCredentials(
  client: ApiClient,
  publicId: string,
): Promise<GeneratedCredentialsResponse> {
  return client.request<GeneratedCredentialsResponse>(
    USER_ENDPOINTS.generateCredentials(publicId),
    {
      method: "POST",
    },
  );
}

export function suspendUser(client: ApiClient, publicId: string): Promise<UserResponse> {
  return client.request<UserResponse>(USER_ENDPOINTS.suspend(publicId), { method: "POST" });
}

export function reactivateUser(client: ApiClient, publicId: string): Promise<UserResponse> {
  return client.request<UserResponse>(USER_ENDPOINTS.reactivate(publicId), { method: "POST" });
}
