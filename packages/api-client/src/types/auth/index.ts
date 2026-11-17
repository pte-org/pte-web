/**
 * Matches identity's real `LoginRequest` record exactly
 * (`{username, password}` —
 * `com/pte/identity/internal/dto/request/auth/LoginRequest.java`).
 *
 * <p>`username` — NOT `email`. Every organization account (student, Host,
 * proctor, examiner) has a generated `{tenant.code}.{random}` username that is
 * not an email address; one username belongs to exactly one organization, so
 * there is no organization to choose at sign-in. Only platform operator
 * accounts still use their email as the username — so the field carries
 * username semantics and no email validation.
 */
export interface LoginRequest {
  username: string;
  password: string;
}

export interface AdminLoginRequest {
  username: string;
  password: string;
}

export interface HostLoginRequest {
  username: string;
  password: string;
}

export interface StudentLoginRequest {
  username: string;
  password: string;
}

/**
 * Matches iam's real token response plus the first-login business flag.
 * Roles and tenant identity still live inside `accessToken` claims
 * (`roles`, `tenant_id`) and must be read via `decodeAccessTokenClaims`.
 */
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresInSeconds: number;
  mustChangePassword: boolean;
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
  /** The caller's own session: when sent, every other session is signed out and this one is kept. */
  refreshToken?: string;
}

export interface PasswordResetRequest {
  email: string;
  /** The account to reset; the server requires it because one e-mail can belong to several accounts. */
  username: string;
}

export interface PasswordResetConfirmRequest {
  token: string;
  newPassword: string;
}

export interface PasswordResetValidateRequest {
  token: string;
}

/** Whether a reset link can still be used. It never says why not. */
export interface PasswordResetTokenStatus {
  valid: boolean;
}
