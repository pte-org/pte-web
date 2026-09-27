import type { ClassMembershipResponse, UserResponse } from "@pte/api-client";

export interface CreateProgramInput {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
}

export interface CreateProgramErrors {
  name?: string;
  startDate?: string;
  endDate?: string;
}

export interface ProgramRosterEntry {
  membership: ClassMembershipResponse;
  student: UserResponse;
}
