/** Mirrors iam's `UserResponse` — the shape `GET /api/iam/auth/me` returns. */
export interface CurrentUser {
  publicId: string;
  email: string;
  fullName: string;
  tenantId: string | null;
  status: string;
  roles: string[];
}
