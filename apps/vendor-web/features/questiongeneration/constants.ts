export const GENERATION_QUERY_KEY = "questionGeneration";
export const GENERATION_JOBS_QUERY_KEY = "generationJobs";
export const GENERATION_QUOTA_QUERY_KEY = "generationQuota";
export const GENERATION_TASK_TYPES_QUERY_KEY = "generationTaskTypes";

/**
 * Polling interval in milliseconds; backend processes items quickly,
 * and the UI should update frequently when a job is running.
 */
export const GENERATION_POLL_INTERVAL_MS = 3000;

/** A topic may be a short brief: the subject, the angle and the kind of picture wanted. */
export const GENERATION_TOPIC_MAX_LENGTH = 500;
export const GENERATION_TOPIC_MIN_ROWS = 3;

/** How a Describe Image question gets its picture; AUTO lets the topic decide. */
export const GENERATION_IMAGE_KINDS = ["AUTO", "CHART", "PICTURE"] as const;
export type GenerationImageKind = (typeof GENERATION_IMAGE_KINDS)[number];
export const DESCRIBE_IMAGE_TASK = "DESCRIBE_IMAGE";

/**
 * Backoff factor for polling when user is not actively watching
 * (tab hidden, stale window, etc.)
 */
export const GENERATION_POLL_BACKOFF_FACTOR = 2;

/**
 * Max retries for a single polling attempt before marking job as stale
 */
export const GENERATION_MAX_POLL_ERRORS = 3;

/**
 * Estimated time per item in seconds (from backend task type response,
 * but we show a rough estimate on the form)
 */
export const GENERATION_ESTIMATED_SECONDS_PER_ITEM = {
  min: 1,
  max: 2,
};

/**
 * Step labels for the progress timeline
 */
export const GENERATION_ITEM_STEPS = {
  QUEUED: "Queued",
  GENERATING: "Generating",
  VALIDATING: "Validating",
  REVIEWING: "Reviewing",
  RENDERING_MEDIA: "Rendering media",
  SAVED: "Saved",
  FAILED: "Failed",
} as const;

/**
 * Icons for each step (fallback if not provided in UI)
 */
export const GENERATION_ITEM_STEP_ICONS: Record<string, string> = {
  QUEUED: "⏳",
  GENERATING: "✎",
  VALIDATING: "✓",
  REVIEWING: "🔍",
  RENDERING_MEDIA: "🔊",
  SAVED: "✓",
  FAILED: "✕",
};

/**
 * Failure reason translations (codes will be translated in messages files)
 */
export const GENERATION_FAILURE_CODES = {
  VALIDATION_FAILED: "VALIDATION_FAILED",
  REVIEW_FAILED: "REVIEW_FAILED",
  MEDIA_RENDERING_FAILED: "MEDIA_RENDERING_FAILED",
  AI_PROVIDER_ERROR: "AI_PROVIDER_ERROR",
  QUOTA_EXCEEDED: "QUOTA_EXCEEDED",
} as const;
