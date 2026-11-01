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
}

export interface ScoreTemplateSlotFeasibilityResponse {
  taskType: string;
  section: string;
  required: number;
  available: number;
  ready: boolean;
  reason: string | null;
}

export interface ScoreTemplateFeasibilityResponse {
  examDefinitionPublicId: string;
  examDefinitionVersion: number;
  ready: boolean;
  slots: ScoreTemplateSlotFeasibilityResponse[];
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
  code: string;
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
