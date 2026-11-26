/** Limits and defaults of the AI generation popup; the server checks every limit again. */

export const GENERATION_SECTIONS = ["SPEAKING", "WRITING", "READING", "LISTENING"] as const;
export type GenerationSection = (typeof GENERATION_SECTIONS)[number];

export const GENERATION_POOLS = ["PRACTICE", "EXAM"] as const;
export const GENERATION_CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
export type GenerationCefrLevel = (typeof GENERATION_CEFR_LEVELS)[number];
export const GENERATION_DEFAULT_POOL = "PRACTICE";
export const GENERATION_DEFAULT_CEFR = "B2";

/** "N exams" multiplier of the Full preset. */
export const PRESET_MULTIPLIER_MIN = 1;
export const PRESET_MULTIPLIER_MAX = 10;

/** Fallback batch cap for an older server that does not report `maxItemsPerBatch`. */
export const GENERATION_FALLBACK_MAX_ITEMS_PER_BATCH = 500;
/** Fallback ETA per question when a task type reports none. */
export const GENERATION_FALLBACK_SECONDS_PER_ITEM = 60;

/** Task types and presets change rarely: fetch them once per session. */
export const GENERATION_STATIC_STALE_MS = 5 * 60 * 1000;
export const GENERATION_PRESETS_QUERY_KEY = "generationPresets";
export const GENERATION_OPEN_BATCH_QUERY_KEY = "generationOpenBatch";

/** Server refusals the popup explains itself instead of a toast. */
export const GENERATION_BATCH_DISABLED_CODE = "GENERATION_BATCH_DISABLED";
export const GENERATION_ALREADY_RUNNING_CODE = "GENERATION_JOB_ALREADY_RUNNING";

/** Matrix columns: task type, one cell per CEFR level, the row total, the row menu. */
export const MATRIX_ROW_GRID =
  "grid grid-cols-[minmax(10rem,1fr)_repeat(6,3.5rem)_3rem_2rem] items-center gap-1.5";

/** Marks of an empty cell and an empty row total: lighter than a 0, so the filled cells stand out. */
export const MATRIX_EMPTY_CELL = "·";
export const MATRIX_EMPTY_TOTAL = "–";

/** Steps the popup can undo; older ones are dropped. */
export const GENERATION_UNDO_LIMIT = 20;
/** "N per task type" shortcut. */
export const GENERATION_FILL_EACH_COUNT = 2;
/** Largest value one matrix cell accepts; the batch cap still applies to the total. */
export const GENERATION_CELL_MAX = 99;
/** The selection of the last started batch, kept per browser for "Same as last time". */
export const GENERATION_LAST_SELECTION_STORAGE_KEY = "pte.questionGeneration.lastSelection";
