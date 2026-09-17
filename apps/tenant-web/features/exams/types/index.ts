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

/** The 4 PTE sections a host picks from to generate an exam (Plan B) — 1 to 4, distinct. */
export type ExamSkill = "SPEAKING" | "WRITING" | "READING" | "LISTENING";

export interface CreateSessionInput {
  name: string;
  skills: ExamSkill[];
  opensAt: string;
  closesAt: string;
  /** Per-session enrollment ceiling; omitted/undefined = unlimited. */
  capacity?: number;
}

export interface CreateSessionErrors {
  name?: string;
  skills?: string;
  opensAt?: string;
  closesAt?: string;
}

export interface AssignedClass {
  classPublicId: string;
  className: string;
  programName: string;
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
