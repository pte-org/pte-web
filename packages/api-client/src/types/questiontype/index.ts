export type QuestionTypeSection = "SPEAKING" | "WRITING" | "READING" | "LISTENING";

/**
 * Additive runtime metadata returned by the platform catalog.
 *
 * The fields remain optional because older API responses and cached clients
 * may still contain the original question-type shape. Keys are semantic
 * allowlist values, never implementation class names or executable rules.
 */
export interface TaskRuntimeProfileDescriptor {
  taskTypeCode?: string;
  profileKey?: string;
  profileVersion?: number;
  behaviorKey?: string;
  rendererKey?: string;
  answerSchemaVersion?: number;
  scoringProfileKey?: string;
  scoringProfileVersion?: number;
  requiredClientCapabilities?: string[];
  status?: "ACTIVE" | "RETIRED" | string;
}

export interface TaskRuntimeReadiness {
  ready: boolean;
  reason?: string | null;
}

export interface SupportedQuestionTypeResponse {
  code: string;
  section: QuestionTypeSection;
  scored: boolean;
  runtime?: TaskRuntimeProfileDescriptor | null;
}

export interface QuestionTypeResponse {
  publicId: string;
  code: string;
  displayName: string;
  shortName: string;
  section: QuestionTypeSection | string;
  scored: boolean;
  active: boolean;
  displayOrder: number;
  requiresAudioPrompt: boolean;
  requiresImagePrompt: boolean;
  requiresPromptText: boolean;
  requiresOptions: boolean;
  requiresCorrectAnswer: boolean;
  requiresWordCount: boolean;
  requiresSingleCorrectOption: boolean;
  usesOptionOrderAsCorrectPosition: boolean;
  /** Canonical additive field; `code` remains the compatibility field. */
  taskTypeCode?: string;
  runtime?: TaskRuntimeProfileDescriptor | null;
  readiness?: TaskRuntimeReadiness | null;
}

/** Terminology aliases for the catalog migration; old names remain valid. */
export type TaskTypeResponse = QuestionTypeResponse;
export type SupportedTaskTypeResponse = SupportedQuestionTypeResponse;

export interface CreateQuestionTypeRequest {
  code: string;
  displayName: string;
  shortName: string;
  section: QuestionTypeSection;
  displayOrder: number;
  active: boolean;
}

export interface UpdateQuestionTypeRequest {
  displayName: string;
  shortName: string;
  displayOrder: number;
  active: boolean;
  requiresAudioPrompt: boolean;
  requiresImagePrompt: boolean;
  requiresPromptText: boolean;
  requiresOptions: boolean;
  requiresCorrectAnswer: boolean;
  requiresWordCount: boolean;
  requiresSingleCorrectOption: boolean;
  usesOptionOrderAsCorrectPosition: boolean;
}
