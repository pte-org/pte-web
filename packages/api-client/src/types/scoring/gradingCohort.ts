export type GradingMarkingMode = "AI_ONLY" | "MANUAL_EXAMINER";

export interface GradingCohortAttemptResponse {
  attemptPublicId: string;
  studentPublicId: string;
  status: string;
  excluded: boolean;
  dispositionReason: string | null;
}

export interface GradingCohortPreviewResponse {
  sessionPublicId: string;
  previewVersion: string;
  finalized: boolean;
  cohortPublicId: string | null;
  markingMode: GradingMarkingMode | null;
  submittedAttemptCount: number;
  outstandingAttemptCount: number;
  attempts: GradingCohortAttemptResponse[];
  blockingReasons: string[];
}

export interface GradingCohortResponse {
  cohortPublicId: string;
  sessionPublicId: string;
  cohortVersion: number;
  status: string;
  markingMode: GradingMarkingMode;
  requiredAttemptCount: number;
  excludedAttemptCount: number;
  expectedItemCount: number;
  satisfiedItemCount: number;
  complete: boolean;
  blockingReasons: string[];
}

export interface GradingCohortDispositionRequest {
  attemptPublicId: string;
  reason: string;
}

export interface FinalizeGradingCohortRequest {
  expectedPreviewVersion: string;
  markingMode: GradingMarkingMode;
  outstandingDispositions: GradingCohortDispositionRequest[];
}
