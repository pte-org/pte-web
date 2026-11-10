/**
 * Local types for the proctor workspace.
 *
 * These types are intentionally **not** in `@pte/api-client` because the
 * backend endpoints that would back them do not exist on
 * `hung/fix-ui-first`. When the real endpoints ship (separate backend
 * workstream), the types move to `packages/api-client/src/types/proctor/`
 * and these local types are deleted. The view layer does not change.
 */

export type ProctorAuditAction = "FORCE_SUBMIT" | "FLAG_VIOLATION" | "CLOSE_SESSION";

export interface ProctorAuditLogEntry {
  publicId: string;
  action: ProctorAuditAction;
  sessionPublicId: string;
  attemptPublicId: string | null;
  note: string;
  createdAt: string;
  performedBy: { publicId: string; fullName: string; email: string };
}

export interface ProctorSecurityAuditEntry {
  publicId: string;
  recordedAt: string;
  eventType: string;
  description: string;
}