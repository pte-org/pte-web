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
  login: "/api/v1/auth/login",
  refresh: "/api/v1/auth/refresh",
  logout: "/api/v1/auth/logout",
  changePassword: "/api/v1/auth/change-password",
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
    credential: payload.email,
    password: payload.password,
  });
}

export function loginHost(
  client: ApiClient,
  payload: HostLoginRequest,
): Promise<AuthResponse> {
  return login(client, {
    credential: payload.email,
    password: payload.password,
  });
}

export function loginStudent(
  client: ApiClient,
  payload: StudentLoginRequest,
): Promise<AuthResponse> {
  return login(client, {
    credential: payload.username,
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
