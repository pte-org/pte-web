import type { ProctorRole, SessionStatus, UserResponse } from "@pte/api-client";

export interface ExamSession {
  id: string;
  name: string;
  snapshotPublicId: string;
  opensAt: string;
  closesAt: string;
  status: SessionStatus;
  /** Null = unlimited. */
  capacity: number | null;
}

export interface Blueprint {
  id: string;
  name: string;
}

export interface CreateSessionInput {
  name: string;
  blueprintPublicId: string;
  opensAt: string;
  closesAt: string;
  /** Per-session enrollment ceiling; omitted/undefined = unlimited. */
  capacity?: number;
}

export interface CreateSessionErrors {
  name?: string;
  blueprintPublicId?: string;
  opensAt?: string;
  closesAt?: string;
}

export interface ProctorAssignmentEntry {
  assignmentPublicId: string;
  proctor: UserResponse;
  role: ProctorRole;
}

export interface CreateProctorInput {
  email: string;
  fullName: string;
  password: string;
}

export interface CreateProctorErrors {
  email?: string;
  fullName?: string;
  password?: string;
}

/**
 * Phase 10's original single-session shape, extended by Phase 11 with an
 * optional `studentsPerSession` — omitted/0 keeps Phase 10's original
 * behavior (one session for the whole roster) exactly, since
 * `splitIntoBatches` treats that as "one batch."
 */
export interface BulkCreateSessionsForProgramInput extends Omit<CreateSessionInput, "capacity"> {
  studentPublicIds: string[];
  studentsPerSession?: number;
}

export type SessionBatchStatus =
  | "pending"
  | "creatingSession"
  | "enrolling"
  | "success"
  | "sessionError"
  | "enrollError";

export interface SessionBatchState {
  index: number;
  total: number;
  studentPublicIds: string[];
  session: ExamSession | null;
  enrolled: string[];
  status: SessionBatchStatus;
  error: unknown;
}
