import type { BadgeVariant } from "@pte/ui";
import type { ScoreTemplateStatusFilter } from "./types";

export const SCORE_TEMPLATES_QUERY_KEY = ["scoreTemplates"] as const;
export const SCORE_TEMPLATE_QUERY_KEY = ["scoreTemplate"] as const;
export const QUESTION_TEMPLATE_BASE_PATH = "/admin/question-template";
export const QUESTION_TEMPLATE_SECTIONS = ["SPEAKING", "WRITING", "READING", "LISTENING"] as const;

export const SCORE_TEMPLATE_TEXT = {
  LIST_TITLE: "Question Templates",
  LIST_SUBTITLE:
    "Manage the PTE question distribution, timing, and scoring templates used to build exams.",
  CLONE_ACTION: "Clone to new draft",
  CREATE_ACTION: "Create template",
  DELETE_ACTION: "Delete",
  CREATE_MODAL_TITLE: "Create question template",
  CREATE_MODAL_SUBTITLE: "Create an empty DRAFT and add question types in the editor.",
  CREATE_ERROR: "Could not create this question template.",
  DELETE_ERROR: "Could not delete this question template.",
  DELETE_CONFIRM: "Delete this DRAFT question template? This cannot be undone.",
  DETAIL_BACK: "Back to list",
  VIEW_ACTION: "View",
  EDIT_ACTION: "Edit",
  EXPORT_ACTION: "Export JSON",
  ADD_TYPE: "Add question type",
  REMOVE_TYPE: "Remove",
  NO_TYPES_TO_ADD: "No active question types are available in this section.",
  SAVE_DRAFT: "Save",
  ACTIVATE_ACTION: "Activate",
  ACTIVATE_MODAL_TITLE: "Activate this template?",
  ACTIVATE_MODAL_WARNING:
    "The current ACTIVE template will be retired immediately. Every new exam published from now on uses this template's weights and timing — exams already published keep the template they were published with.",
  ACTIVATE_CONFIRM: "Activate",
  ACTIVATE_CANCEL: "Cancel",
  NOT_DRAFT_ERROR:
    "This template is no longer editable — it stopped being a DRAFT (e.g. someone else activated a newer version). Reload the list to see the current state.",
  CONCURRENT_MODIFICATION_ERROR:
    "Another admin changed this template's family at the same moment. Reload and try again.",
} as const;

export const SCORE_TEMPLATE_LIST_HEADERS = {
  CODE: "Code",
  VERSION: "Version",
  NAME: "Name",
  STATUS: "Status",
  ITEMS: "Items",
  ACTIONS: "Actions",
} as const;

export const SCORE_TEMPLATE_ITEM_HEADERS = {
  SEQUENCE: "#",
  TASK_TYPE: "Task type",
  SECTION: "Section",
  MIN_COUNT: "Min",
  MAX_COUNT: "Max",
  PREP_SECONDS: "Prep (s)",
  RESPONSE_SECONDS: "Response (s)",
  OVERALL_WEIGHT: "Overall %",
  SPEAKING_WEIGHT: "Speaking %",
  WRITING_WEIGHT: "Writing %",
  READING_WEIGHT: "Reading %",
  LISTENING_WEIGHT: "Listening %",
} as const;

export const SCORE_TEMPLATE_STATUS_LABELS: Record<ScoreTemplateStatusFilter, string> = {
  ACTIVE: "Active",
  DRAFT: "Draft",
  RETIRED: "Retired",
};

export const SCORE_TEMPLATE_STATUS_VARIANT: Record<ScoreTemplateStatusFilter, BadgeVariant> = {
  ACTIVE: "success",
  DRAFT: "warning",
  RETIRED: "neutral",
};
