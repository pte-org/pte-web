import type { ApiClient } from "../../client/client";
import type {
  AdminLoginRequest,
  AuthResponse,
  ChangePasswordRequest,
  HostLoginRequest,
  LoginRequest,
  LogoutRequest,
  RefreshTokenRequest,
  StudentLoginRequest,
} from "../../types/auth";

export const AUTH_ENDPOINTS = {
  login: "/api/iam/auth/login",
  refresh: "/api/iam/auth/refresh",
  logout: "/api/iam/auth/logout",
  /**
   * No backend controller anywhere in `pte-api` exposes this — `iam`'s
   * `AuthController` only has `/login`, `/refresh`, `/logout` (verified via
   * repo-wide grep for `change-password`/`ChangePassword`). Deliberately
   * left as a plausible-but-fictitious path rather than removed, matching
   * `types/account/index.ts`'s `CurrentUser` treatment — unused anywhere
   * in these apps today (confirmed via grep), not wired to anything real.
   */
  changePassword: "/api/iam/auth/change-password",
} as const;

export function login(
  client: ApiClient,
  payload: LoginRequest,
): Promise<AuthResponse> {
  return client.request<AuthResponse>(AUTH_ENDPOINTS.login, {
    method: "POST",
    body: payload,
  });
}

export function loginAdmin(
  client: ApiClient,
  payload: AdminLoginRequest,
): Promise<AuthResponse> {
  return login(client, {
    email: payload.email,
    password: payload.password,
  });
}

export function loginHost(
  client: ApiClient,
  payload: HostLoginRequest,
): Promise<AuthResponse> {
  return login(client, {
    email: payload.email,
    password: payload.password,
  });
}

/**
 * Unused by any app in this monorepo today (confirmed via grep) — kept for
 * API-surface completeness. iam's real `LoginRequest` has no `username`
 * field, only `email`; mapping `payload.username` onto `email` is the best
 * available correspondence, not a verified contract (there is no consumer
 * to test it against). Revisit if/when a student-facing web login is
 * actually built here.
 */
export function loginStudent(
  client: ApiClient,
  payload: StudentLoginRequest,
): Promise<AuthResponse> {
  return login(client, {
    email: payload.username,
    password: payload.password,
  });
}

export function refreshAuth(
  client: ApiClient,
  payload: RefreshTokenRequest,
): Promise<AuthResponse> {
  return client.request<AuthResponse>(AUTH_ENDPOINTS.refresh, {
    method: "POST",
    body: payload,
  });
}

export function logout(
  client: ApiClient,
  payload: LogoutRequest,
): Promise<void> {
  return client.request<void>(AUTH_ENDPOINTS.logout, {
    method: "POST",
    body: payload,
  });
}

export function changePassword(
  client: ApiClient,
  payload: ChangePasswordRequest,
): Promise<void> {
  return client.request<void>(AUTH_ENDPOINTS.changePassword, {
    method: "POST",
    body: payload,
  });
}
