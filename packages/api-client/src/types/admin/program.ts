/** Matches admin's real `ProgramStatus` enum. */
export type ProgramStatusResponse = "ACTIVE" | "INACTIVE" | "SUSPENDED";

/** Matches admin's real `ProgramResponse` record exactly. */
export interface ProgramResponse {
  publicId: string;
  organizationPublicId: string;
  name: string;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  status: ProgramStatusResponse;
}

/** Matches admin's real `CreateProgramRequest` record exactly. */
export interface CreateProgramRequest {
  name: string;
  description?: string | null;
  startDate?: string | null;
  endDate?: string | null;
}

/** Matches admin's real `UpdateProgramRequest` record exactly. */
export interface UpdateProgramRequest {
  name: string;
  description?: string | null;
  startDate?: string | null;
  endDate?: string | null;
}

/** Matches admin's real `ClassStudentCountResponse` record exactly. */
export interface ClassStudentCountResponse {
  classPublicId: string;
  className: string;
  studentCount: number;
}

/** Matches admin's real `ProgramDashboardResponse` record exactly. */
export interface ProgramDashboardResponse {
  programPublicId: string;
  classCount: number;
  studentCount: number;
  classes: ClassStudentCountResponse[];
}
