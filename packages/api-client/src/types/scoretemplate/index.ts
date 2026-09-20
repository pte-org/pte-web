// Mirrors pte-api's com.pte.scoretemplate.dto.{response,request} DTOs exactly
// (Phase 1, plans/score-template-exam-generation). taskType/section are plain
// strings on the backend too — scoretemplate stays independent of itembank's
// PteTaskType/PteSection enums.

export type ScoreTemplateStatus = "DRAFT" | "ACTIVE" | "RETIRED";
export type ScoringMethod = "AI_SPEECH" | "AI_TEXT" | "OBJECTIVE" | "UNSCORED";

export interface ScoreTemplateItemResponse {
  taskType: string;
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
}

export interface ScoreTemplateResponse {
  publicId: string;
  code: string;
  version: number;
  name: string;
  status: ScoreTemplateStatus | string;
  items: ScoreTemplateItemResponse[];
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
  taskType: string;
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
}
