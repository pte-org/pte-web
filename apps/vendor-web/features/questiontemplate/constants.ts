export const QUESTION_TYPES_QUERY_KEY = ["questionTypes"] as const;

export const QUESTION_TYPE_TEXT = {
  TITLE: "Question Types",
  SUBTITLE:
    "Manage the PTE question-type catalog used by authoring, validation, and exam delivery.",
  EDIT: "Edit",
  SAVE: "Save changes",
  CANCEL: "Cancel",
  ACTIVE: "Active",
  INACTIVE: "Inactive",
  EDIT_TITLE: "Edit question type",
  UPDATE_SUCCESS: "Question type updated.",
  LOAD_ERROR: "Could not load question types. Please refresh.",
  SAVE_ERROR: "Could not update this question type. Please try again.",
  IMPORT_TITLE: "Import question types from a template",
  IMPORT_SUBTITLE:
    "Export a Question Template JSON from VPS, choose it here, then import its task types into this catalog.",
  CHOOSE_FILE: "Choose template JSON",
  IMPORT: "Import question types",
  IMPORT_SUCCESS: "Question types imported from the template.",
  IMPORT_ERROR: "Could not import question types from this file.",
} as const;

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
