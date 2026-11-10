export const SCORING_RUBRIC_BASE_PATH = "/admin/scoring-rubric";

/** Display order of the four communicative skills; a task type is listed under every skill it counts toward. */
export const RUBRIC_SKILLS = ["SPEAKING", "WRITING", "READING", "LISTENING"] as const;
export const RUBRIC_SKILL_FILTER_ALL = "ALL";

/** Shown instead of a fixed maximum for a per-word trait (Read Aloud Content: N = words in the passage). */
export const PER_WORD_MAX_SYMBOL = "N";

/** Without a version id the server answers with the ACTIVE rubric version. */
const ACTIVE_VERSION_KEY = "ACTIVE";

export const SCORING_RUBRIC_QUERY_KEYS = {
  all: ["scoringRubric"] as const,
  taskTypes: (versionId: string | null) =>
    [...SCORING_RUBRIC_QUERY_KEYS.all, "taskTypes", versionId ?? ACTIVE_VERSION_KEY] as const,
  taskType: (taskType: string, versionId: string | null) =>
    [
      ...SCORING_RUBRIC_QUERY_KEYS.all,
      "taskType",
      taskType,
      versionId ?? ACTIVE_VERSION_KEY,
    ] as const,
  versions: () => [...SCORING_RUBRIC_QUERY_KEYS.all, "versions"] as const,
};

/** The page of one task type; {@code versionId} shows that version's rubric instead of the active one. */
export const scoringRubricDetailHref = (taskType: string, versionId?: string): string =>
  `${SCORING_RUBRIC_BASE_PATH}/${encodeURIComponent(taskType)}${versionId ? `?${RUBRIC_VERSION_PARAM}=${encodeURIComponent(versionId)}` : ""}`;

/** Query parameter that names the rubric version a task type page shows. */
export const RUBRIC_VERSION_PARAM = "version";
