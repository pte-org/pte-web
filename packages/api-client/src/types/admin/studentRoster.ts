/** Matches admin's paged student-roster response row. */
export interface StudentRosterRow {
  studentPublicId: string;
  email: string;
  fullName: string;
  studentCode: string | null;
  phone: string | null;
  status: "ACTIVE" | "SUSPENDED";
  createdAt: string;
  programPublicId: string | null;
  programName: string | null;
  classPublicId: string | null;
  className: string | null;
  username: string;
  mustChangePassword: boolean;
}

export type StudentRosterAssignmentStatus = "ALL" | "ASSIGNED" | "UNASSIGNED";
export type StudentRosterSort = "CREATED_AT" | "FULL_NAME" | "STUDENT_CODE";
export type StudentRosterDirection = "ASC" | "DESC";

export interface StudentRosterQuery {
  page: number;
  size: number;
  search?: string;
  programPublicId?: string;
  classPublicId?: string;
  assignmentStatus?: StudentRosterAssignmentStatus;
  sort?: StudentRosterSort;
  direction?: StudentRosterDirection;
}
