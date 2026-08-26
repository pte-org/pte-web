/** Matches scheduling's real `SessionResponse` record exactly. */
export interface CompositionItemResponse {
  taskType: string;
  count: number;
}

export type SessionStatus = "SCHEDULED" | "OPEN" | "CLOSED";

export interface SessionResponse {
  publicId: string;
  name: string;
  tenantId: string;
  snapshotPublicId: string;
  opensAt: string;
  closesAt: string;
  status: SessionStatus;
  composition: CompositionItemResponse[];
}

/** Matches scheduling's real `CreateSessionRequest` record exactly. */
export interface CreateSessionRequest {
  name: string;
  snapshotPublicId: string;
  opensAt: string;
  closesAt: string;
}

/** Matches scheduling's real `EnrollmentResponse` record exactly. */
export interface EnrollmentResponse {
  publicId: string;
  sessionPublicId: string;
  studentPublicId: string;
}

/** Matches scheduling's real `BulkEnrollRequest`/`BulkEnrollResponse` records exactly. */
export interface BulkEnrollRequest {
  studentPublicIds: string[];
}

export interface BulkEnrollResponse {
  enrolled: string[];
  alreadyEnrolled: string[];
}

/** Matches scheduling's real `ProctorAssignmentResponse` record exactly. */
export interface ProctorAssignmentResponse {
  publicId: string;
  sessionPublicId: string;
  proctorPublicId: string;
}

/** Matches scheduling's real `AssignProctorRequest` record exactly. */
export interface AssignProctorRequest {
  proctorPublicId: string;
}
