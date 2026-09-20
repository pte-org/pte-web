import type { PagedResult } from "../../client/client";

/** Matches iam's real `UserResponse` record exactly. */
export interface UserResponse {
  publicId: string;
  username: string;
  email: string;
  fullName: string;
  tenantId: string | null;
  status: "ACTIVE" | "SUSPENDED";
  roles: string[];
  studentCode: string | null;
  className: string | null;
  phone: string | null;
  dateOfBirth: string | null;
  organizationType?: string | null;
  mustChangePassword: boolean;
}

export type ExamStaffRole = "PROCTOR" | "EXAMINER";
export type ExamStaffRoleFilter = "ALL" | ExamStaffRole;
export type UserStatusFilter = "ALL" | "ACTIVE" | "SUSPENDED";
export type UserListSort = "CREATED_AT" | "FULL_NAME" | "EMAIL";
export type UserListDirection = "ASC" | "DESC";

export interface ExamStaffQuery {
  page: number;
  size: number;
  search?: string;
  role?: ExamStaffRoleFilter;
  status?: UserStatusFilter;
  sort?: UserListSort;
  direction?: UserListDirection;
}

export type ExamStaffPage = PagedResult<UserResponse>;

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

/** One-time result from the server-generated credential rotation endpoint. */
export interface GeneratedCredentialsResponse {
  publicId: string;
  username: string;
  email: string | null;
  fullName: string | null;
  temporaryPassword: string;
  emailQueued: boolean;
}

/** Matches iam's real `BulkCreateUserRow` record exactly (one Excel roster row). */
export interface BulkCreateUserRow {
  email?: string | null;
  fullName?: string | null;
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
    username: string;
    email: string | null;
    fullName: string | null;
    generatedPassword: string;
  }[];
  skipped: {
    rowIndex: number;
    email: string | null;
    reason: string;
  }[];
}
