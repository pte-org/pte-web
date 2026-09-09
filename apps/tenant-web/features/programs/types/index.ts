import type { UserResponse } from "@pte/api-client";

export interface CreateProgramInput {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
}

export interface CreateProgramErrors {
  name?: string;
}

export interface CoordinatorAssignmentEntry {
  assignmentPublicId: string;
  coordinator: UserResponse;
}

export interface CreateCoordinatorInput {
  email: string;
  fullName: string;
  password: string;
}

export interface CreateCoordinatorErrors {
  email?: string;
  fullName?: string;
  password?: string;
}
