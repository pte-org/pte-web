/**
 * Matches identity's real `LoginRequest` record exactly
 * (`{username, password, tenantId?}` —
 * `com/pte/identity/internal/dto/request/LoginRequest.java`).
 *
 * <p>`username` — NOT `email`. The login key moved off email in Phase 1 of
 * the commercialization work: a STUDENT's username is
 * `{tenant.code}.{random}` and is not an email address at all, and two
 * tenants may now hold the same email. For every non-STUDENT role the
 * backend sets `username = email`, so those users still type their email
 * here — but the field name and its validation are username semantics.
 */
export interface LoginRequest {
  username: string;
  password: string;
  tenantId?: string | null;
}

export interface AdminLoginRequest {
  username: string;
  password: string;
  tenantId?: string | null;
}

export interface HostLoginRequest {
  username: string;
  password: string;
  tenantId?: string | null;
}

export interface StudentLoginRequest {
  username: string;
  password: string;
  tenantId?: string | null;
}

export interface LoginOrganizationOptionsRequest {
  username: string;
  password: string;
}

export interface LoginOrganizationOption {
  tenantId: string;
  tenantCode: string;
  organizationName: string;
  organizationType: string;
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
