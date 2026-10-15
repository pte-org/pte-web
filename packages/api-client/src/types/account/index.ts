/** Mirrors identity's `UserResponse` — the shape `GET /api/v1/auth/me` returns. */
export interface CurrentUser {
  publicId: string;
  email: string;
  fullName: string;
  phone: string | null;
  dateOfBirth: string | null;
  tenantId: string | null;
  status: string;
  roles: string[];
  organizationType: string | null;
}

export interface UpdateOwnProfileRequest {
  fullName: string;
  phone: string | null;
  dateOfBirth: string | null;
}
