export const QUESTION_TYPES_QUERY_KEY = ["questionTypes"] as const;
export const SUPPORTED_QUESTION_TYPES_QUERY_KEY = ["supportedQuestionTypes"] as const;
export const TASK_TYPES_QUERY_KEY = ["taskTypes"] as const;
export const SUPPORTED_TASK_TYPES_QUERY_KEY = ["supportedTaskTypes"] as const;

export const QUESTION_TYPE_TEXT = {
  TITLE: "Task Type Catalog",
  SUBTITLE: "Manage task keys and the released screens used by authoring, validation, and exam delivery.",
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
  CREATE_ERROR: "Could not add this task type. Check the key, display name, and selected screen.",
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
  ROW_ACTIONS: "Task type actions",
  YES: "Yes",
  NO: "No",
  EMPTY_LIST: "No task types are currently in the catalog.",
  LOADING: "Loading task type catalog...",
  CATALOG_BOUNDARY_NOTICE:
    "Task type keys are configurable metadata. Interaction and scoring behavior come from a released screen contract selected below.",
  SEPARATOR: "·",
} as const;

export const QUESTION_TYPE_EDITOR_TEXT = {
  TASK_TYPE_KEY: "Task type key",
  SECTION: "Section",
  DISPLAY_NAME: "Display name",
  SHORT_NAME: "Short name",
  DISPLAY_ORDER: "Display order",
  AVAILABLE_FOR_NEW_QUESTIONS: "Available for new questions",
  SCREEN_KEY: "Screen key",
  CONTRACT_VERSION: "Contract version",
  SELECT_SCREEN_KEY: "Select a released screen",
  SELECT_CONTRACT_VERSION: "Select a contract version",
  CONTRIBUTES_TO_SCORING: "· contributes to scoring",
  NOT_SCORED: "· not scored",
  RUNTIME_SOURCE_NOTICE:
    "The selected released screen contract supplies authoring, interaction, and scoring behavior.",
  CREATE_NOTICE:
    "Enter a unique task type key and choose a released screen contract. The platform derives runtime behavior from that contract.",
  EDIT_NOTICE:
    "You can update the display metadata and runtime binding while this task type has not been used by a published template.",
  RUNTIME_LOCKED_NOTICE:
    "This task type is used by a published template. Its screen, contract, and section are locked; only display metadata can be changed.",
  INVALID_KEY_FORMAT:
    "Use 2–64 characters: start with A–Z, then use only A–Z, 0–9, or underscore.",
  KEY_ALREADY_USED: "This task type key is already used. Choose a different key.",
  DISPLAY_NAME_ALREADY_USED: "This display name is already used. Choose a different name.",
  DISPLAY_NAME_INVALID: "Enter a display name between 1 and 128 characters.",
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
  TASK_TYPE_DISPLAY_NAME_INVALID: "Enter a display name between 1 and 128 characters.",
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
