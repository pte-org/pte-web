import type { SCORE_EXPLANATION_ROLES } from "./constants";

export type {
  ItemExplanationResponse,
  ItemTraceKind,
  RubricParametersResponse,
  ScoreExplanationResponse,
  SkillExplanationResponse,
  SkillTermResponse,
  TaskTypeAverageResponse,
  TaskTypeParametersResponse,
} from "@pte/api-client";

export type ScoreExplanationRole = (typeof SCORE_EXPLANATION_ROLES)[number];

/** One trait of an item's rubric trace, as the API sent it. */
export interface TraitTraceRow {
  key: string;
  achieved: number;
  max: number;
  effectiveWeight: number;
  weightedContribution?: number | null;
  /** True when this trait is the gate that zeroed the item. */
  gateTriggered: boolean;
}
