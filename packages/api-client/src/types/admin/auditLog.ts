/** Matches admin's real `AuditLogResponse` record exactly. */
export interface AuditLogResponse {
  publicId: string;
  actorUserId: string;
  /** Comma-joined roles the actor held when the entry was written; null on older rows. */
  actorRole: string | null;
  aggregateType: string;
  aggregateId: string;
  resourceName: string | null;
  resourceCode: string | null;
  action: string;
  summary: string;
  /** True when a before/after snapshot can be loaded with `getPlatformAuditLog`. */
  hasStateChange: boolean;
  createdAt: string;
}

/** A business snapshot as stored by the API: a JSON object, or a truncation marker for oversized states. */
export type AuditState = Record<string, unknown>;

/** One platform audit entry with its snapshots; `beforeState` is null for a creation, `afterState` for a deletion. */
export interface AuditLogDetailResponse {
  entry: AuditLogResponse;
  beforeState: AuditState | null;
  afterState: AuditState | null;
}

/** Narrows the platform audit list to one actor and/or one audited object. */
export interface PlatformAuditScope {
  actorId?: string;
  aggregateId?: string;
}
