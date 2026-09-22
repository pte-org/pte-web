export const QUESTION_TYPES_QUERY_KEY = ["questionTypes"] as const;
export const SUPPORTED_QUESTION_TYPES_QUERY_KEY = ["supportedQuestionTypes"] as const;
export const TASK_TYPES_QUERY_KEY = ["taskTypes"] as const;
export const SUPPORTED_TASK_TYPES_QUERY_KEY = ["supportedTaskTypes"] as const;

export const QUESTION_TYPE_TEXT = {
  TITLE: "Task Type Catalog",
  SUBTITLE: "Manage the standard PTE task types used by authoring, validation, and exam delivery.",
  CREATE: "Create task type",
  EDIT: "Edit",
  DELETE: "Delete",
  CREATE_TITLE: "Create task type",
  SAVE: "Save changes",
  CANCEL: "Cancel",
  ACTIVE: "Active",
  INACTIVE: "Inactive",
  EDIT_TITLE: "Edit task type",
  CREATE_SUCCESS: "Task type created.",
  UPDATE_SUCCESS: "Task type updated.",
  DELETE_SUCCESS: "Task type removed from the active catalog.",
  LOAD_ERROR: "Could not load the task type catalog. Please refresh.",
  CREATE_ERROR: "Could not add this standard task type. Please try again.",
  SAVE_ERROR: "Could not update this task type. Please try again.",
  DELETE_ERROR: "Could not remove this task type. Please try again.",
  DELETE_CONFIRM:
    "Remove this task type from the active catalog? Existing questions remain available, but new questions and templates cannot use it.",
  TABLE_QUESTION_TYPE: "Task type",
  TABLE_ORDER: "#",
  TABLE_SECTION: "Section",
  TABLE_REQUIREMENTS: "Requirements",
  TABLE_SCORED: "Scored",
  TABLE_STATUS: "Status",
  TABLE_ACTIONS: "Actions",
  YES: "Yes",
  NO: "No",
  EMPTY_LIST: "No task types are currently in the catalog.",
  LOADING: "Loading task type catalog...",
  CATALOG_BOUNDARY_NOTICE:
    "This catalog contains standard PTE task types only. A new interaction or scoring behavior requires a platform release; it cannot be created from this form.",
  STANDARD_SOURCE_NOTICE:
    "Choose a task type supplied by the platform. Its section, scoring behavior, and authoring contract are server-defined.",
  SEPARATOR: "·",
} as const;

export const QUESTION_TYPE_EDITOR_TEXT = {
  TASK_TYPE: "Task type",
  SECTION: "Section",
  DISPLAY_NAME: "Display name",
  SHORT_NAME: "Short name",
  DISPLAY_ORDER: "Display order",
  AVAILABLE_FOR_NEW_QUESTIONS: "Available for new questions",
  SELECT_TASK_TYPE: "Select task type",
  ALL_STANDARD_TYPES_EXIST: "All standard types already exist",
  CONTRIBUTES_TO_SCORING: "· contributes to scoring",
  NOT_SCORED: "· not scored",
  SELECT_STANDARD_TASK_TYPE: "· select a standard task type",
  EMPTY_CODE: "—",
  CANONICAL_REQUIREMENTS_NOTICE:
    "Authoring requirements come from the selected standard task type. A new interaction or scoring rule requires a platform release.",
  AUTHORING_REQUIREMENTS: "Authoring requirements",
} as const;

export const QUESTION_TYPE_ERROR_MESSAGES: Record<string, string> = {
  QUESTION_TYPE_NOT_FOUND:
    "This task type is no longer available. Refresh the catalog and try again.",
  QUESTION_TYPE_CODE_ALREADY_USED:
    "That task type is already in the catalog. Refresh the page to see the current entry.",
  INVALID_QUESTION_TYPE:
    "Choose a standard PTE task type with the section supplied by the platform.",
  TASK_RUNTIME_PROFILE_NOT_FOUND:
    "This task type has not been enabled for the current platform runtime yet.",
  TASK_RUNTIME_PROFILE_NOT_ACTIVE:
    "This task type is temporarily unavailable for new authoring or templates.",
  TASK_RUNTIME_PROFILE_NOT_ALLOWED:
    "This task type uses a runtime profile that the platform no longer supports. Contact the platform administrator.",
};

export const QUESTION_TYPE_SECTIONS = ["SPEAKING", "WRITING", "READING", "LISTENING"] as const;

export const QUESTION_TYPE_REQUIREMENT_LABELS = [
  ["requiresPromptText", "Prompt text"],
  ["requiresAudioPrompt", "Audio"],
  ["requiresImagePrompt", "Image"],
  ["requiresOptions", "Options"],
  ["requiresCorrectAnswer", "Correct answer"],
  ["requiresWordCount", "Word count"],
  ["requiresSingleCorrectOption", "Single correct"],
  ["usesOptionOrderAsCorrectPosition", "Ordered options"],
] as const;
