import type { TaskTypeRubricResponse } from "@pte/api-client";
import type { RUBRIC_SKILLS, RUBRIC_SKILL_FILTER_ALL } from "./constants";

export type {
  AzureBandThresholdResponse,
  AzureMappingResponse,
  RubricFormBandResponse,
  RubricGateTraitResponse,
  RubricObjectiveRuleResponse,
  RubricTraitDetailsResponse,
  RubricVersionResponse,
  ScoreTemplateResponse,
  TaskTypeRubricResponse,
} from "@pte/api-client";

export type RubricSkill = (typeof RUBRIC_SKILLS)[number];
export type RubricSkillFilter = typeof RUBRIC_SKILL_FILTER_ALL | RubricSkill;

export interface RubricTaskTypeGroup {
  skill: RubricSkill;
  taskTypes: TaskTypeRubricResponse[];
}

/** One task type's weights as stored on an exam template item (never recomputed here). */
export interface TemplateSkillWeights {
  overall: number;
  speaking: number;
  writing: number;
  reading: number;
  listening: number;
}
