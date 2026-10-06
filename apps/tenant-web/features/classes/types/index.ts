import type { UserResponse } from "@pte/api-client";

export interface LecturerAssignmentEntry {
  assignmentPublicId: string;
  lecturer: UserResponse;
}

export interface CreateLecturerInput {
  email: string;
  fullName: string;
  password: string;
}

export interface CreateLecturerErrors {
  email?: string;
  fullName?: string;
  password?: string;
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
