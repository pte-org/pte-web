import type { ScoreTemplateFeasibilityResponse } from "../scoretemplate";

export type SessionStatus =
  "DRAFT" | "PREPARING" | "READY" | "SCHEDULED" | "OPEN" | "CLOSED" | "CANCELLED";

/**
 * Matches scheduling's real `SessionResponse` record exactly (Plan B, Phase
 * 3 removed `composition` — a student now pins every item of the generated
 * snapshot, there is no host-chosen subset anymore; the dev-merge subscription
 * gate added `subscriptionPublicId` and made `capacity` mandatory).
 */
export interface SessionResponse {
  publicId: string;
  name: string;
  tenantId: string;
  subscriptionPublicId: string;
  snapshotPublicId: string | null;
  opensAt: string;
  closesAt: string;
  status: SessionStatus;
  capacity: number;
  templatePublicId: string | null;
  templateVersion: number | null;
  examMode: ExamMode | null;
  formMode: FormMode | null;
  reusePolicy: ReusePolicy | null;
  seriesKey: string | null;
  generationJobPublicId: string | null;
  draftVersion: number;
  /** Additive fields; optional so older API fixtures/clients remain source-compatible. */
  selectedSkills?: string[] | null;
  maxRetriesPerStudent?: number;
}

/** Host preview of the immutable published snapshot; deliberately answer-stripped. */
export interface ExamPreviewResponse {
  snapshotPublicId: string;
  name: string;
  version: number;
  items: ExamPreviewItem[];
}

export interface ExamPreviewItem {
  orderIndex: number;
  section: string;
  taskType: string;
  taskTypeCode: string;
  taskTypeDisplayName: string;
  title: string;
  promptText: string | null;
  audioUrl: string | null;
  imageUrl: string | null;
  minWordCount: number | null;
  maxWordCount: number | null;
  options: ExamPreviewOption[];
}

/** Scoring flags are intentionally absent. */
export interface ExamPreviewOption {
  orderIndex: number;
  blankIndex: number | null;
  text: string;
}

export type ExamMode = "PRACTICE" | "MOCK_TEST" | "REAL_EXAM";
export type LockdownMode = "NONE" | "STANDARD" | "STRICT";
export type FormMode = "SHARED_FORM" | "UNIQUE_FORM_PER_STUDENT";
export type ReusePolicy =
  | "ALLOW"
  | "EXCLUDE_STARTED_IN_SERIES"
  | "EXCLUDE_ASSIGNED_IN_SERIES"
  | "BLOCK_ON_SCHEDULE_OVERLAP";

/**
 * Matches scheduling's real `CreateSessionRequest` record exactly (Plan B,
 * Phase 3 generates the exam from `skills` — 1-4 distinct sections, not a
 * pre-published `snapshotPublicId` chosen by hand; the dev-merge subscription
 * gate requires `subscriptionPublicId` and made `capacity` mandatory).
 */
export interface CreateSessionRequest {
  name: string;
  subscriptionPublicId: string;
  skills: string[];
  opensAt: string;
  closesAt: string;
  examMode?: ExamMode | null;
  lockdownMode?: LockdownMode | null;
  capacity: number;
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

export interface CreateExamDraftRequest {
  name: string;
  templatePublicId: string;
  subscriptionPublicId: string;
  opensAt: string;
  closesAt: string;
  examMode?: ExamMode | null;
  formMode?: FormMode | null;
  reusePolicy?: ReusePolicy | null;
  seriesKey?: string | null;
  capacity: number;
  selectedSkills?: string[];
  maxRetriesPerStudent?: number;
}

export interface PatchExamDraftRequest {
  name?: string;
  templatePublicId?: string;
  subscriptionPublicId?: string;
  opensAt?: string;
  closesAt?: string;
  examMode?: ExamMode;
  formMode?: FormMode;
  reusePolicy?: ReusePolicy;
  seriesKey?: string | null;
  capacity?: number;
  expectedVersion?: number;
  selectedSkills?: string[];
  maxRetriesPerStudent?: number;
}

export type AudienceSourceType = "STUDENT" | "CLASS" | "PROGRAM";

export interface AudienceSourceRequest {
  sourceType: AudienceSourceType;
  sourcePublicId: string;
}

export interface AudienceSourceResponse extends AudienceSourceRequest {
  publicId: string;
}

export type AudienceMemberStatus = "CANDIDATE" | "ELIGIBLE" | "EXCLUDED" | "ENROLLED";
export type AudienceDecisionReason =
  | "DUPLICATE_SOURCE"
  | "ALREADY_ASSIGNED"
  | "ALREADY_STARTED"
  | "SCHEDULE_OVERLAP"
  | "OUTSIDE_TENANT"
  | "CAPACITY_EXCEEDED";

export interface AudienceMemberResponse {
  studentPublicId: string;
  status: AudienceMemberStatus;
  reason: AudienceDecisionReason | null;
  sourceSummary: string;
  priorSessionPublicId: string | null;
  priorSessionName: string | null;
  priorStatus: SessionStatus | null;
}

export interface AudiencePreviewResponse {
  candidateCount: number;
  duplicateCount: number;
  eligibleCount: number;
  excludedCount: number;
  blockedCount: number;
  capacity: number;
  capacityReady: boolean;
  members: AudienceMemberResponse[];
}

export interface ExamPreflightResponse {
  ready: boolean;
  template: ScoreTemplateFeasibilityResponse;
  audience: AudiencePreviewResponse;
  subscriptionReady: boolean;
  windowReady: boolean;
  overlapReady: boolean;
  issues: string[];
}

export type GenerationJobStatus = "QUEUED" | "RUNNING" | "SUCCEEDED" | "FAILED" | "CANCELLED";

export interface GenerationJobResponse {
  publicId: string;
  sessionPublicId: string;
  status: GenerationJobStatus;
  formsTotal: number;
  formsCompleted: number;
  algorithmVersion: string;
}
