// Mirrors pte-api's com.pte.scoring.internal.rubric.dto records (vendor-only read API of the platform rubric).
// Structure and level descriptions come from the code catalog; numbers come from the rubric version row.

export type RubricVersionStatus = "DRAFT" | "PENDING" | "ACTIVE" | "REJECTED" | "RETIRED";
export interface SimulationTextMetrics {
  wordCount: number;
  sentenceCount: number;
  allCaps: boolean;
  punctuationPresent: boolean;
  bulletOnly: boolean;
}

export interface RubricSimulationRequest {
  taskType: string;
  rubricVersionPublicId?: string;
  traitScores: Record<string, number>;
  textMetrics?: SimulationTextMetrics;
  wordCount?: number;
}

export interface RubricSimulationResponse {
  rubricVersionPublicId: string;
  rawScore: number;
  formBand: number | null;
  scoreTrace: import("../scoreexplanation").ScoreTraceResponse;
}
export type RubricTraitSource = "AI_LLM" | "AZURE" | "MECHANICAL" | "OBJECTIVE";

/** The Score Guide's description of one trait level, quoted in English. */
export interface RubricLevelResponse {
  level: number;
  text: string;
}

/** One trait; `maxScore` is null for a per-word scale (Read Aloud Content), whose maximum is the word count. */
export interface RubricTraitDetailsResponse {
  defaultWeight?: number;
  key: string;
  displayNameVi: string;
  displayNameEn: string;
  maxScore: number | null;
  perWord: boolean;
  source: RubricTraitSource | string;
  pearsonPages: string;
  weight: number;
  levels: RubricLevelResponse[];
}

/** A gate trait: when enabled, a 0 on this trait zeroes the whole item. */
export interface RubricGateTraitResponse {
  traitKey: string;
  enabled: boolean;
}

/** A word-count range (inclusive) and the Form score it earns. */
export interface RubricFormBandResponse {
  minWords: number;
  maxWords: number;
  band: number;
}

/** How an answer-key task type is scored, for display. */
export interface RubricObjectiveRuleResponse {
  code: string;
  descriptionVi: string;
  pearsonPages: string;
}

/** The lowest Azure score (0-100, inclusive) that earns a band of Pronunciation or Oral Fluency. */
export interface AzureBandThresholdResponse {
  band: number;
  minAzureScore: number;
}

/**
 * The Azure-to-Pearson band table a version uses. While `calibrated` is false, `label` carries the
 * "not calibrated against human-rater data" notice that must be shown next to the table.
 */
export interface AzureMappingResponse {
  version: string;
  calibrated: boolean;
  label: string | null;
  pronunciationInput: string | null;
  oralFluencyInput: string | null;
  pronunciationBands: AzureBandThresholdResponse[];
  oralFluencyBands: AzureBandThresholdResponse[];
}

/**
 * One task type's rubric in one rubric version. `formBands`, `objectiveRule` and `azureMapping`
 * are null when they do not apply to the task type.
 */
export interface TaskTypeRubricResponse {
  taskType: string;
  skills: string[];
  pearsonPages: string;
  versionPublicId: string;
  versionNo: number;
  catalogVersion: number;
  traits: RubricTraitDetailsResponse[];
  gates: RubricGateTraitResponse[];
  formBands: RubricFormBandResponse[] | null;
  objectiveRule: RubricObjectiveRuleResponse | null;
  azureMapping: AzureMappingResponse | null;
}

/** A rubric version's metadata (its parameters are read per task type). */
export interface RubricVersionResponse {
  lockVersion?: number;
  publicId: string;
  versionNo: number;
  status: RubricVersionStatus | string;
  catalogVersion: number;
  authorUserPublicId: string | null;
  approverUserPublicId: string | null;
  rejectionReason: string | null;
  submittedAt: string | null;
  decidedAt: string | null;
  activatedAt: string | null;
  retiredAt: string | null;
}

export interface RubricTaskParameters {
  traitWeights: Record<string, number>;
  traitScales: Record<string, number | "PER_WORD">;
  formBands: RubricFormBandResponse[] | null;
  gateEnabled: Record<string, boolean>;
}
export interface RubricParametersDocument {
  azureBandMappingVersion: number;
  taskTypes: Record<string, RubricTaskParameters>;
}
export interface RubricWriteRequest { parameters: RubricParametersDocument; expectedLockVersion?: number }
export interface RubricStatusRequest {
  action: "SUBMIT" | "ACTIVATE" | "REJECT" | "DISCARD";
  reason?: string;
  expectedActiveVersionPublicId?: string;
  confirmedDiffDigest?: string;
}
export interface RubricDiffResponse {
  expectedActiveVersionPublicId: string;
  diffDigest: string;
  changes: { path: string; beforeValue: string | null; afterValue: string | null }[];
}
export interface RubricActivationAuditResponse {
  publicId: string;
  versionPublicId: string;
  previousActivePublicId: string | null;
  actorUserPublicId: string;
  activatedAt: string;
  diffSummary: string | null;
}
