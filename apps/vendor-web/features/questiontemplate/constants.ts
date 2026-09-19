export const QUESTION_TYPES_QUERY_KEY = ["questionTypes"] as const;
export const SUPPORTED_QUESTION_TYPES_QUERY_KEY = ["supportedQuestionTypes"] as const;

export const QUESTION_TYPE_TEXT = {
  TITLE: "Question Types",
  SUBTITLE:
    "Manage the PTE question-type catalog used by authoring, validation, and exam delivery.",
  CREATE: "Create question type",
  EDIT: "Edit",
  DELETE: "Delete",
  CREATE_TITLE: "Create question type",
  SAVE: "Save changes",
  CANCEL: "Cancel",
  ACTIVE: "Active",
  INACTIVE: "Inactive",
  EDIT_TITLE: "Edit question type",
  CREATE_SUCCESS: "Question type created.",
  UPDATE_SUCCESS: "Question type updated.",
  DELETE_SUCCESS: "Question type deleted.",
  LOAD_ERROR: "Could not load question types. Please refresh.",
  CREATE_ERROR: "Could not create this question type. Please try again.",
  SAVE_ERROR: "Could not update this question type. Please try again.",
  DELETE_ERROR: "Could not delete this question type. Please try again.",
  DELETE_CONFIRM:
    "Delete this question type? Existing questions will remain, but new questions cannot use it.",
  TABLE_QUESTION_TYPE: "Question type",
  TABLE_ORDER: "#",
  TABLE_SECTION: "Section",
  TABLE_REQUIREMENTS: "Requirements",
  TABLE_SCORED: "Scored",
  TABLE_STATUS: "Status",
  TABLE_ACTIONS: "Actions",
  YES: "Yes",
  NO: "No",
  EMPTY_LIST: "No question types found.",
  LOADING: "Loading question types...",
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
    "Authoring requirements are set from the selected standard task type. You can fine-tune them after creating the type.",
  AUTHORING_REQUIREMENTS: "Authoring requirements",
} as const;

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
