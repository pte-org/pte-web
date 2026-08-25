/** Matches admin's real `QuotaActionType` enum. This phase only ever produces `GRANTED` rows. */
export type QuotaActionType = "GRANTED" | "DEDUCTED" | "REVOKED";

/** Matches admin's real `QuotaTransactionResponse` record exactly. */
export interface QuotaTransactionResponse {
  publicId: string;
  tenantPublicId: string;
  packageName: string;
  amount: number;
  actionType: QuotaActionType;
  actorUserId: string;
  note: string | null;
  createdAt: string;
}

/** Matches admin's real `GrantQuotaRequest` record exactly — the only action this phase implements. */
export interface GrantQuotaRequest {
  packageName: string;
  amount: number;
  note: string | null;
}
