export type SessionStatus = "SCHEDULED" | "OPEN" | "CLOSED";

/**
 * Matches scheduling's real `SessionResponse` record exactly (Plan B, Phase
 * 3 removed `composition` — a student now pins every item of the generated
 * snapshot, there is no host-chosen subset anymore).
 */
export interface SessionResponse {
  publicId: string;
  name: string;
  tenantId: string;
  snapshotPublicId: string;
  opensAt: string;
  closesAt: string;
  status: SessionStatus;
  /** Null = unlimited. */
  capacity: number | null;
}

export type ExamMode = "PRACTICE" | "MOCK_TEST" | "REAL_EXAM";
export type LockdownMode = "NONE" | "STANDARD" | "STRICT";

/**
 * Matches scheduling's real `CreateSessionRequest` record exactly (Plan B,
 * Phase 3) — the exam is generated from `skills` (1-4 distinct sections),
 * not a pre-published `snapshotPublicId` chosen by hand.
 */
export interface CreateSessionRequest {
  name: string;
  skills: string[];
  opensAt: string;
  closesAt: string;
  examMode?: ExamMode | null;
  lockdownMode?: LockdownMode | null;
  /** Null/omitted = unlimited. */
  capacity?: number | null;
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

/** Matches scheduling's real `ProctorRole` enum exactly. */
export type ProctorRole = "LEAD_PROCTOR" | "ASSISTANT_PROCTOR";

/** Matches scheduling's real `ProctorAssignmentResponse` record exactly. */
export interface ProctorAssignmentResponse {
  publicId: string;
  sessionPublicId: string;
  proctorPublicId: string;
  role: ProctorRole;
}

/** Matches scheduling's real `AssignProctorRequest` record exactly. */
export interface AssignProctorRequest {
  proctorPublicId: string;
  role?: ProctorRole | null;
}

/** Matches scheduling's real `UpdateProctorRoleRequest` record exactly. */
export interface UpdateProctorRoleRequest {
  role: ProctorRole;
}

/** Matches scheduling's real `AssignClassRequest`/`SessionClassAssignmentResponse` records exactly (Plan B, Phase 4). */
export interface AssignClassRequest {
  classPublicId: string;
}

export interface SessionClassAssignmentResponse {
  sessionPublicId: string;
  classPublicId: string;
}

/**
 * Matches scheduling's real `StudentEnrollmentResponse` record exactly —
 * backs `admin`'s (FE's) pending-exam-request transfer warning. `opensAt`/
 * `closesAt` are ISO instants (backend `Instant`, serialized as strings).
 */
export interface StudentEnrollmentResponse {
  enrollmentPublicId: string;
  sessionPublicId: string;
  sessionName: string;
  status: SessionStatus;
  opensAt: string;
  closesAt: string;
}
