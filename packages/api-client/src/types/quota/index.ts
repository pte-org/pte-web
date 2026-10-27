/** Matches the API's `QuotaGrantResponse` record exactly: one append-only seat grant. */
export interface QuotaGrantResponse {
  publicId: string;
  tenantPublicId: string;
  packageName: string;
  amount: number;
  actorUserId: string;
  note: string | null;
  createdAt: string;
}

/** Matches the API's `GrantQuotaRequest` record exactly. */
export interface GrantQuotaRequest {
  packageName: string;
  amount: number;
  note: string | null;
}
