import type { PagedResult } from "../../client/client";

export interface StudentAssignmentView {
  classPublicId: string;
  className: string;
  programPublicId: string;
  programName: string;
}

export interface StudentDetailResponse {
  publicId: string;
  username: string;
  email: string | null;
  fullName: string | null;
  tenantId: string;
  status: "ACTIVE" | "SUSPENDED";
  roles: string[];
  studentCode: string | null;
  phone: string | null;
  dateOfBirth: string | null;
  mustChangePassword: boolean;
  assignment: StudentAssignmentView | null;
}

export type StudentAttemptStatus = "CREATED" | "IN_PROGRESS" | "SUBMITTED";
export type StudentHistoryReportState =
  "NOT_AVAILABLE" | "UNPUBLISHED" | "PUBLISHED" | "PUBLISHED_LEGACY";

export interface StudentAttemptHistoryRow {
  attemptPublicId: string;
  sessionPublicId: string;
  sessionName: string;
  sessionCode: string | null;
  sessionStatus: string | null;
  attemptNumber: number;
  status: StudentAttemptStatus;
  createdAt: string;
  startedAt: string | null;
  submittedAt: string | null;
  reportState: StudentHistoryReportState;
  reportAvailable: boolean;
  overallScore: number | null;
  overallSufficientData: boolean;
}

export type StudentAttemptHistoryPage = PagedResult<StudentAttemptHistoryRow>;

export interface StudentSkillPerformance {
  skill: "LISTENING" | "READING" | "SPEAKING" | "WRITING";
  averageScore: number | null;
  available: boolean;
  sampleCount: number;
}

export interface StudentPerformanceResponse {
  attemptCount: number;
  latestAttemptAt: string | null;
  averageOverall: number | null;
  averageOverallAvailable: boolean;
  skills: StudentSkillPerformance[];
  calculationScope: string;
}

export interface StudentHistoryQuery {
  page: number;
  size: number;
  from?: string;
  to?: string;
  status?: StudentAttemptStatus | "ALL";
}
