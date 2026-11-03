// Mirrors pte-api's com.pte.scoretemplate.dto.{response,request} DTOs exactly
import type { TaskRuntimeProfileDescriptor, TaskRuntimeReadiness } from "../questiontype";

// (Phase 1, plans/score-template-exam-generation). taskType/section are plain
// strings on the backend too — scoretemplate stays independent of itembank's
// PteTaskType/PteSection enums.

export type ScoreTemplateStatus = "DRAFT" | "PENDING_APPROVAL" | "ACTIVE" | "RETIRED";
export type ScoringMethod = "AI_SPEECH" | "AI_TEXT" | "OBJECTIVE" | "UNSCORED";
export type ScoreTemplatePolicy = "STANDARD_PTE" | "CUSTOM";

export interface ScoreTemplateItemResponse {
  taskType: string | null;
  taskTypeKey: string;
  section: string;
  sequence: number;
  minCount: number;
  maxCount: number;
  prepSeconds: number;
  responseSeconds: number;
  scoringMethod: ScoringMethod | string;
  overallWeight: number;
  speakingWeight: number;
  writingWeight: number;
  readingWeight: number;
  listeningWeight: number;
  /** Additive runtime provenance; absent for legacy template responses. */
  runtime?: TaskRuntimeProfileDescriptor | null;
}

export interface ScoreTemplateResponse {
  publicId: string;
  code: string;
  version: number;
  name: string;
  status: ScoreTemplateStatus | string;
  rejectionReason: string | null;
  items: ScoreTemplateItemResponse[];
  templatePolicy: ScoreTemplatePolicy | string;
  readiness?: TaskRuntimeReadiness | null;
  /** Owning host tenant; null/absent for platform (admin) templates. */
  tenantId?: string | null;
  /** Admin default a host template was cloned from. */
  baseDefinitionPublicId?: string | null;
  /** Audit fields of the template; the author name is resolved only on the platform detail read. */
  createdAt?: string | null;
  updatedAt?: string | null;
  authorUserPublicId?: string | null;
  authorName?: string | null;
  /** Pearson time window of the template, in seconds; null when it has none. */
  timeFrame?: ScoreTemplateTimeFrame | null;
  /** Host templates only: whether it still follows the platform template it came from. */
  pearsonStandard?: boolean | null;
  /** Why a host template is no longer Pearson standard, e.g. `WEIGHTS_CHANGED:READ_ALOUD`. */
  standardDeviations?: string[];
  /** CEFR mix exams built from the template aim for; empty means no mix. */
  cefrTargets?: CefrTarget[];
}

/** Time window of a template in seconds: a range per Pearson part and a ceiling for the whole test. */
export interface ScoreTemplateTimeFrame {
  speakingWritingMinSeconds: number;
  speakingWritingMaxSeconds: number;
  readingMinSeconds: number;
  readingMaxSeconds: number;
  listeningMinSeconds: number;
  listeningMaxSeconds: number;
  totalMaxSeconds: number;
}

/** Share, in whole percent, of one CEFR level. */
export interface CefrTarget {
  level: string;
  percent: number;
}

export interface ScoreTemplateSlotFeasibilityResponse {
  taskType: string;
  section: string;
  required: number;
  available: number;
  ready: boolean;
  reason: string | null;
  /** Questions available per CEFR level, with `UNCLASSIFIED` for those without one. */
  cefrCounts?: Record<string, number>;
}

/** Planned duration of one Pearson part, in seconds, next to the template's window for it. */
export interface PartTimeFeasibilityResponse {
  part: "SPEAKING_WRITING" | "READING" | "LISTENING";
  minSeconds: number;
  maxSeconds: number;
  frameMinSeconds: number | null;
  frameMaxSeconds: number | null;
  /** Null when the template has no time frame. */
  canFitFrame: boolean | null;
}

export interface ScoreTemplateFeasibilityResponse {
  examDefinitionPublicId: string;
  examDefinitionVersion: number;
  ready: boolean;
  slots: ScoreTemplateSlotFeasibilityResponse[];
  parts?: PartTimeFeasibilityResponse[];
  /** Ceiling of the whole test in seconds; null without a time frame. */
  totalMaxSeconds?: number | null;
}

export interface RejectScoreTemplateRequest {
  reason: string;
}

/**
 * Same shape as `ScoreTemplateItemResponse` minus `scoringMethod` and
 * `overallWeight` — kept as a separate type since the backend has a
 * separate request record (`ScoreTemplateItemRequest`) with its own
 * validation. Both are backend-derived, never accepted as admin input:
 * `scoringMethod` is intrinsic to `taskType`, and `overallWeight` is always
 * the mean of the 4 skill weights (PTE weighs all 4 skills equally toward
 * the overall score).
 */
export interface ScoreTemplateItemRequest {
  taskType?: string | null;
  taskTypeKey: string;
  section: string;
  sequence: number;
  minCount: number;
  maxCount: number;
  prepSeconds: number;
  responseSeconds: number;
  speakingWeight: number;
  writingWeight: number;
  readingWeight: number;
  listeningWeight: number;
}

export interface ReplaceScoreTemplateItemsRequest {
  name: string;
  items: ScoreTemplateItemRequest[];
  templatePolicy?: ScoreTemplatePolicy | string;
}

export interface CreateScoreTemplateRequest {
  /** Left out, the server derives one from the name. */
  code?: string;
  name: string;
  templatePolicy?: ScoreTemplatePolicy | string;
}

export type SkillName = "SPEAKING" | "WRITING" | "READING" | "LISTENING";

export interface CreateHostExamTemplateRequest {
  name: string;
}

export interface SkillWeightItem {
  taskTypeKey: string;
  section: string;
  speakingWeight: number;
  writingWeight: number;
  readingWeight: number;
  listeningWeight: number;
}

export interface SkillWeightSuggestionRequest {
  items: SkillWeightItem[];
}

export interface SkillTaskWeight {
  taskTypeKey: string;
  weight: number;
}

export interface SkillWeightSuggestion {
  skill: SkillName | string;
  currentTotal: number;
  /** 100 - currentTotal: positive when weight is missing, negative when over. */
  deficit: number;
  balanced: boolean;
  /** Keeps the old ratio between tasks. Empty when balanced. */
  proportional: SkillTaskWeight[];
  /** Adds the same share to every weighted task. Empty when balanced. */
  equal: SkillTaskWeight[];
}

export interface SkillWeightSuggestionResponse {
  skills: SkillWeightSuggestion[];
}
