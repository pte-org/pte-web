/** Matches iam's real `LoginRequest` record exactly (`{email, password}` —
 * `services/iam/.../dto/request/LoginRequest.java`). There is no
 * `credential`/generic-identifier field on the backend. */
export interface LoginRequest {
  email: string;
  password: string;
}

export interface AdminLoginRequest {
  email: string;
  password: string;
}

export interface HostLoginRequest {
  email: string;
  password: string;
}

export interface StudentLoginRequest {
  username: string;
  password: string;
}

/**
 * Matches iam's real `TokenResponse` record exactly
 * (`services/iam/.../dto/response/TokenResponse.java`) — no `role`/
 * `tenantId`/`userType`/`mustChangePassword` fields exist on this response;
 * those claims live inside `accessToken` itself (`roles`, `tenant_id`) and
 * must be read via `decodeAccessTokenClaims` after login, not off this
 * object.
 */
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresInSeconds: number;
}

export type JwtTokenResponse = AuthResponse;

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface LogoutRequest {
  refreshToken: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
