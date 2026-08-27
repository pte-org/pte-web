/** Matches iam's real `UserResponse` record exactly. */
export interface UserResponse {
  publicId: string;
  email: string;
  fullName: string;
  tenantId: string | null;
  status: "ACTIVE" | "SUSPENDED";
  roles: string[];
  studentCode: string | null;
  className: string | null;
  phone: string | null;
  dateOfBirth: string | null;
}

/** Matches iam's real `CreateUserRequest` record exactly. */
export interface CreateUserRequest {
  email: string;
  fullName: string;
  password: string;
  roles: string[];
  tenantId: string | null;
  studentCode?: string | null;
  className?: string | null;
  phone?: string | null;
  dateOfBirth?: string | null;
}

/** Matches iam's real `ResetPasswordRequest` record exactly. */
export interface ResetPasswordRequest {
  newPassword: string;
}

/** Matches iam's real `BulkCreateUserRow` record exactly (one Excel roster row). */
export interface BulkCreateUserRow {
  email: string;
  fullName: string;
  studentCode?: string | null;
  className?: string | null;
  phone?: string | null;
  dateOfBirth?: string | null;
}

/** Matches iam's real `BulkCreateUsersRequest` record exactly. */
export interface BulkCreateUsersRequest {
  rows: BulkCreateUserRow[];
  tenantId: string | null;
}

/** Matches iam's real `BulkCreateUsersResponse` record exactly. */
export interface BulkCreateUsersResponse {
  created: {
    publicId: string;
    email: string;
    fullName: string;
    generatedPassword: string;
  }[];
  skipped: {
    rowIndex: number;
    email: string;
    reason: string;
  }[];
}
