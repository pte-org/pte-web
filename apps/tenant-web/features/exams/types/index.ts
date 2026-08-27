import type { ProctorRole, SessionStatus, UserResponse } from "@pte/api-client";

export interface ExamSession {
  id: string;
  name: string;
  snapshotPublicId: string;
  opensAt: string;
  closesAt: string;
  status: SessionStatus;
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
