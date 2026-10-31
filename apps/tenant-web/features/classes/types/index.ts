import type { ClassMembershipResponse, UserResponse } from "@pte/api-client";

export interface ClassRosterEntry {
  membership: ClassMembershipResponse;
  student: UserResponse;
}

export interface AddStudentInput {
  email: string;
  fullName: string;
  studentCode?: string;
  phone?: string;
  dateOfBirth?: string;
}

export interface AddStudentErrors {
  email?: string;
  fullName?: string;
}
