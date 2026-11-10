// Mirrors pte-api's ScoreExplanationResponse (com.pte.reporting.internal.dto.response) and the public scoring
// views it embeds (com.pte.scoring.dto.response, com.pte.scoring.rubric.ScoreTrace). Every number is the
// server's; BigDecimal fields arrive as JSON numbers.
import type { RubricFormBandResponse } from "../scoringrubric";

/** How an answer's item score can be explained (`ItemTraceKind`). */
export type ItemTraceKind =
  | "RUBRIC"
  | "LEGACY_NO_TRACE"
  | "EXAMINER_SCORE"
  | "OBJECTIVE"
  | "UNSCORED"
  | "NOT_SCORED"
  | "TRACE_UNAVAILABLE";

export type ItemScoreSource = "AI" | "EXAMINER" | "OBJECTIVE";

/** One trait's share of an item score: points achieved out of its maximum and the weight actually applied. */
export interface TraitContributionResponse {
  key: string;
  achieved: number;
  max: number;
  effectiveWeight: number;
  /** Server-calculated weight × achieved / max; absent in older published snapshots. */
  weightedContribution?: number | null;
}

/** How an item score was reached: unrounded percentage, rounded score, the gate that zeroed it (if any). */
export interface ScoreTraceResponse {
  itemScore: number;
  rawPercent: number;
  gateTriggeredBy: string | null;
  contributions: TraitContributionResponse[];
}

/** Parameters of one task type in the pinned (ACTIVE or RETIRED) rubric version. */
export interface TaskTypeParametersResponse {
  taskType: string;
  traitWeights: Record<string, number>;
  formBands: RubricFormBandResponse[] | null;
  gateEnabled: Record<string, boolean>;
  azureMappingVersion: string | null;
  /** Null when the task type has no Azure-scored trait. */
  azureMappingCalibrated: boolean | null;
  azureMappingLabel: string | null;
}

/** The pinned rubric version's parameters for the task types of one attempt; never a draft. */
export interface RubricParametersResponse {
  versionPublicId: string;
  versionNo: number;
  status: string;
  catalogVersion: number;
  taskTypes: TaskTypeParametersResponse[];
}

/** One answer's item score and how it was reached; `trace` is set only for kind RUBRIC. */
export interface ItemExplanationResponse {
  answerPublicId: string;
  taskType: string;
  section: string | null;
  scoreSource: ItemScoreSource | string | null;
  itemScore: number | null;
  traceKind: ItemTraceKind | string;
  traitScores: Record<string, number> | null;
  wordCount: number | null;
  rubricVersionPublicId: string | null;
  objectiveRuleCode: string | null;
  trace: ScoreTraceResponse | null;
}

/** A task type's average: `sum / (scoredCount + blankCount)`; blanks count as 0. */
export interface TaskTypeAverageResponse {
  taskType: string;
  scoredCount: number;
  blankCount: number;
  sum: number;
  average: number;
}

/** A weighted task type in a skill's sum; `excluded` terms have no average and are left out of both sums. */
export interface SkillTermResponse {
  taskType: string;
  weight: number;
  average: number | null;
  contribution: number | null;
  excluded: boolean;
}

/**
 * A skill's (or Overall's) chain: weightedSum = Σ(w × avg / 100), totalWeight = Σw, ratio, scaledScore =
 * 10 + 80 × ratio before half-up rounding to `score`. Chain fields are null when no trace is available.
 */
export interface SkillExplanationResponse {
  skill: string;
  score: number | null;
  sufficientData: boolean;
  weightedSum: number | null;
  totalWeight: number | null;
  ratio: number | null;
  scaledScore: number | null;
  terms: SkillTermResponse[];
}

/** Every step from trait scores to the 10-90 scores of one attempt, for its Host or assigned Examiner. */
export interface ScoreExplanationResponse {
  attemptPublicId: string;
  sessionPublicId: string;
  published: boolean;
  publishedAt: string | null;
  /** 1 or 2 for a published snapshot; null when recomputed live for an unpublished attempt. */
  schemaVersion: number | null;
  traceAvailable: boolean;
  includesUnselectedAiScores: boolean;
  examDefinitionPublicId: string | null;
  examDefinitionVersion: number | null;
  rubricVersionPublicId: string | null;
  /** Present only when the pinned version is ACTIVE or RETIRED. */
  rubricParameters: RubricParametersResponse | null;
  items: ItemExplanationResponse[];
  taskTypeAverages: TaskTypeAverageResponse[];
  skills: SkillExplanationResponse[];
  /** Null when the exam did not test all four skills. */
  overall: SkillExplanationResponse | null;
}
