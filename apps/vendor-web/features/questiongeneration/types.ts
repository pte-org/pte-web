import type {
  QuestionGenerationItemResponse,
  QuestionGenerationJobResponse,
  QuestionGenerationTaskTypeResponse,
} from "@pte/api-client";

/**
 * Mapped generation task type for the form
 */
export interface GenerationTaskType extends QuestionGenerationTaskTypeResponse {
  section: "SPEAKING" | "WRITING" | "READING" | "LISTENING";
  displayName: string;
}

/**
 * Mapped generation job for internal use
 */
export interface GenerationJob extends QuestionGenerationJobResponse {
  /** Section derived from taskType */
  section: "SPEAKING" | "WRITING" | "READING" | "LISTENING";
}

/**
 * Item with UI state for the progress tray
 */
export interface GenerationItemUI extends QuestionGenerationItemResponse {
  /** For display in the progress tray */
  displayIndex: number;
}

/**
 * Job with UI state for the progress tray
 */
export interface GenerationJobUI extends GenerationJob {
  /** Collapsed/expanded state */
  expanded: boolean;
  /** Items with UI state */
  itemsUI: GenerationItemUI[];
}
