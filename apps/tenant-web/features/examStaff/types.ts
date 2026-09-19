import type { ExamStaffRole } from "@pte/api-client";

export interface CreateExamStaffInput {
  email: string;
  fullName: string;
  password: string;
  role: ExamStaffRole;
}

export interface CreateExamStaffErrors {
  email?: string;
  fullName?: string;
  password?: string;
}
