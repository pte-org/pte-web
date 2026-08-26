/** Matches iam's real `UserResponse` record exactly. */
export interface UserResponse {
  publicId: string;
  email: string;
  fullName: string;
  tenantId: string | null;
  status: "ACTIVE" | "SUSPENDED";
  roles: string[];
}

/** Matches iam's real `CreateUserRequest` record exactly. */
export interface CreateUserRequest {
  email: string;
  fullName: string;
  password: string;
  roles: string[];
  tenantId: string | null;
}

/** Matches iam's real `ResetPasswordRequest` record exactly. */
export interface ResetPasswordRequest {
  newPassword: string;
}
