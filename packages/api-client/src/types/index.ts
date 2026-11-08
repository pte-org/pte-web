// Hand-written API types mirroring pte-api (Spring Boot) DTOs.
// This file is the intended target if/when codegen from an OpenAPI spec replaces
// hand-written types.
export * from "./auth";
export * from "./account";
export * from "./asset";
export * from "./question";
export * from "./questiontype";
export * from "./tenant";
export * from "./organization";
export * from "./quota";
export * from "./user";
export * from "./scheduling";
export * from "./authoring";
export * from "./scoring";
export * from "./reporting";
export * from "./scoretemplate";
export * from "./scoringrubric";
export * from "./scoreexplanation";
export * from "./assessment";
export * from "./admin";
export * from "./billing";
export * from "./notification";
export * from "./support";
export * from "./proctoring";
export * from "./attendance";
export * from "./incidents";
export * from "./dashboard";
export * from "./location";
// Question generation (com.pte.itembank.internal.generation)
export type {
  QuestionGenerationJobStatus,
  QuestionGenerationItemStage,
  QuestionGenerationJobAction,
  QuestionGenerationTaskTypeResponse,
  QuestionGenerationItemResponse,
  QuestionGenerationJobResponse,
  QuestionGenerationQuotaResponse,
  QuestionGenerationJobCreateRequest,
  QuestionGenerationJobStatusRequest,
  QuestionGenerationLiveAgent,
  QuestionGenerationLiveText,
  QuestionGenerationLiveItem,
  QuestionGenerationLiveEvent,
} from "./generation";

// AI administration (com.pte.itembank.internal.generation.controller.AiAdminController)
export type {
  AiStatusLimits,
  AiStatusResponse,
  PromptCategory,
  PromptBlockType,
  PromptLevelRow,
  PromptBlock,
  PromptSection,
  PromptDocument,
  PromptSummary,
  PromptCategoryEntries,
  PromptCatalogResponse,
  PromptVersionStatus,
  PromptContentSection,
  PromptContent,
  PromptTestInfo,
  PromptVersionSummary,
  PromptVersionResponse,
  PromptProposalRequest,
  PromptWorkspaceResponse,
  PromptStatusRequest,
  PromptTestResponse,
  GenerationTaskTypeStats,
  GenerationTokenStats,
  GenerationFailureStats,
  GenerationStatsResponse,
} from "./ai";
