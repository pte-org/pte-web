import type { CreatedAccount } from "@/features/examoperations/types";

const PENDING_CLASS_ASSIGNMENT_KEY_PREFIX = "pte.pendingClassAssignment.";

function pendingClassAssignmentKey(classPublicId: string): string {
  return `${PENDING_CLASS_ASSIGNMENT_KEY_PREFIX}${classPublicId}`;
}

/**
 * Same recovery discipline as `examoperations`'s `savePendingImport` — persists
 * step 1's (account creation) result until step 2 (Class assignment) confirms,
 * so a crash/failed assign never strands a one-time generated password.
 * Keyed by `classPublicId` (this flow's destination) rather than a session's
 * publicId. Best-effort — sessionStorage may throw (private browsing).
 */
export function savePendingClassAssignment(classPublicId: string, created: CreatedAccount[]): void {
  try {
    sessionStorage.setItem(pendingClassAssignmentKey(classPublicId), JSON.stringify(created));
  } catch {
    // best-effort — ignore
  }
}

export function loadPendingClassAssignment(classPublicId: string): CreatedAccount[] | null {
  try {
    const raw = sessionStorage.getItem(pendingClassAssignmentKey(classPublicId));
    return raw ? (JSON.parse(raw) as CreatedAccount[]) : null;
  } catch {
    return null;
  }
}

export function clearPendingClassAssignment(classPublicId: string): void {
  try {
    sessionStorage.removeItem(pendingClassAssignmentKey(classPublicId));
  } catch {
    // best-effort — ignore
  }
}
