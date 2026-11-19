/** Limits and defaults of the AI generation popup; the server checks every limit again. */

export const GENERATION_SECTIONS = ["SPEAKING", "WRITING", "READING", "LISTENING"] as const;
export type GenerationSection = (typeof GENERATION_SECTIONS)[number];

export const GENERATION_POOLS = ["PRACTICE", "EXAM"] as const;
export const GENERATION_CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
export const GENERATION_DEFAULT_POOL = "PRACTICE";
export const GENERATION_DEFAULT_CEFR = "B2";

/** "N exams" multiplier of the Full preset. */
export const PRESET_MULTIPLIER_MIN = 1;
export const PRESET_MULTIPLIER_MAX = 10;

/** Fallback batch cap for an older server that does not report `maxItemsPerBatch`. */
export const GENERATION_FALLBACK_MAX_ITEMS_PER_BATCH = 50;
/** Fallback ETA per question when a task type reports none. */
export const GENERATION_FALLBACK_SECONDS_PER_ITEM = 60;

/** Task types and presets change rarely: fetch them once per session. */
export const GENERATION_STATIC_STALE_MS = 5 * 60 * 1000;
export const GENERATION_PRESETS_QUERY_KEY = "generationPresets";
export const GENERATION_OPEN_BATCH_QUERY_KEY = "generationOpenBatch";

/** Server refusals the popup explains itself instead of a toast. */
export const GENERATION_BATCH_DISABLED_CODE = "GENERATION_BATCH_DISABLED";
export const GENERATION_ALREADY_RUNNING_CODE = "GENERATION_JOB_ALREADY_RUNNING";




/** Columns of a task-type line in the popup: name, count, CEFR, picture kind, own-topics toggle. */
export const TASK_ROW_GRID = "grid grid-cols-[minmax(0,1fr)_6rem_7rem_9rem_8rem] gap-3";
