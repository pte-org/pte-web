/** Matches admin's real `AuditLogResponse` record exactly. */
export interface AuditLogResponse {
  publicId: string;
  actorUserId: string;
  aggregateType: string;
  aggregateId: string;
  action: string;
  summary: string;
  createdAt: string;
}
