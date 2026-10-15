/** Matches admin's real `AuditLogResponse` record exactly. */
export interface AuditLogResponse {
  publicId: string;
  actorUserId: string;
  aggregateType: string;
  aggregateId: string;
  resourceName: string | null;
  resourceCode: string | null;
  action: string;
  summary: string;
  createdAt: string;
}
