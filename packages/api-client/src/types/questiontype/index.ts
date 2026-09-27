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
  taskTypeKey?: string;
  screenKey?: string;
  contractVersion?: number;
  profileKey?: string;
  profileVersion?: number;
  behaviorKey?: string;
  rendererKey?: string;
  answerSchemaVersion?: number;
  scoringProfileKey?: string;
  scoringProfileVersion?: number;
  scoringMode?: "SCORED" | "NONE" | string;
  requiredClientCapabilities?: string[];
  minSupportedAppVersion?: string | null;
  authoringContractKey?: string;
  authoringContractVersion?: number;
  authoringRequirements?: Record<string, boolean> | null;
  status?: "ACTIVE" | "RETIRED" | string;
}

export interface TaskRuntimeReadiness {
  ready: boolean;
  serverReady?: boolean;
  clientSupport?: "SUPPORTED" | "MANIFEST_REQUIRED" | "UNSUPPORTED" | string;
  issues?: Array<{ code: string; message: string; remediation?: string | null }>;
  reason?: string | null;
}

export interface TaskTypeEditability {
  taskTypeKey: boolean;
  runtimeFields: boolean;
  displayMetadata: boolean;
  lockedReason?: string | null;
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
  taskTypeKey?: string;
  screenKey?: string;
  contractVersion?: number;
  runtime?: TaskRuntimeProfileDescriptor | null;
  readiness?: TaskRuntimeReadiness | null;
  editability?: TaskTypeEditability | null;
}

/** Terminology aliases for the catalog migration; old names remain valid. */
export type TaskTypeResponse = QuestionTypeResponse;
export type SupportedTaskTypeResponse = SupportedQuestionTypeResponse;

export interface CreateQuestionTypeRequest {
  code: string;
  taskTypeKey?: string;
  displayName: string;
  shortName: string;
  section: QuestionTypeSection;
  displayOrder: number;
  active: boolean;
  screenKey?: string;
  contractVersion?: number;
}

export interface CreateTaskTypeRequest {
  taskTypeKey: string;
  displayName: string;
  shortName: string;
  section: QuestionTypeSection;
  screenKey: string;
  contractVersion: number;
  displayOrder: number;
  active: boolean;
}

export interface UpdateTaskTypeRequest {
  displayName: string;
  shortName: string;
  displayOrder: number;
  active: boolean;
  screenKey?: string;
  contractVersion?: number;
  section?: QuestionTypeSection;
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
  screenKey?: string;
  contractVersion?: number;
}

export interface TaskTypeAvailabilityResponse {
  taskTypeKey: { normalized: string | null; available: boolean; conflictCode?: string | null };
  displayName: { normalized: string | null; available: boolean; conflictCode?: string | null };
}

export interface TaskTypeCapabilityResponse {
  screenKey: string;
  contractVersion: number;
  profileKey: string;
  behaviorKey: string;
  rendererKey: string;
  answerSchemaVersion: number;
  scoringProfileKey: string;
  scoringProfileVersion: number;
  scoringMode: "SCORED" | "NONE" | string;
  requiredClientCapabilities: string[];
  minSupportedAppVersion?: string | null;
  authoringContractKey: string;
  authoringContractVersion: number;
  authoringRequirements: Record<string, boolean>;
  status: "ACTIVE" | "RETIRED" | string;
}

export interface TaskTypePageResponse {
  items: QuestionTypeResponse[];
  nextCursor: string | null;
}
