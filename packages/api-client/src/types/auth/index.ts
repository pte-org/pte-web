export type Role = "ADMIN" | "HOST" | "STUDENT";

export interface LoginRequest {
  credential: string;
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

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  role: Role;
  userType: string;
  tenantId: number | null;
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
}
