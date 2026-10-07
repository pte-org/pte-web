/**
 * Local types for the proctor workspace.
 *
 * These types are intentionally **not** in `@pte/api-client` because the
 * backend endpoints that would back them do not exist on
 * `hung/fix-ui-first`. When the real endpoints ship (separate backend
 * workstream), the types move to `packages/api-client/src/types/proctor/`
 * and these local types are deleted. The view layer does not change.
 */

export type AttemptStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED";

export interface ProctorLiveAttempt {
  attemptPublicId: string;
  studentPublicId: string;
  studentName: string;
  status: AttemptStatus;
  startedAt: string | null;
  lastHeartbeatAt: string | null;
  flagged: boolean;
  notesCount: number;
}