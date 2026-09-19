import type { BadgeVariant } from "@pte/ui";
import type { ScoreTemplateStatusFilter } from "./types";

export const SCORE_TEMPLATES_QUERY_KEY = ["scoreTemplates"] as const;
export const SCORE_TEMPLATE_QUERY_KEY = ["scoreTemplate"] as const;
export const QUESTION_TEMPLATE_BASE_PATH = "/admin/question-template";

export const SCORE_TEMPLATE_TEXT = {
  LIST_TITLE: "Question Templates",
  LIST_SUBTITLE:
    "Manage the PTE question distribution, timing, and scoring templates used to build exams.",
  CLONE_ACTION: "Clone to new draft",
  DETAIL_BACK: "Back to list",
  VIEW_ACTION: "View",
  EDIT_ACTION: "Edit",
  IMPORT_ACTION: "Import JSON",
  EXPORT_ACTION: "Export JSON",
  IMPORT_ERROR: "Could not import this question template file.",
  ADD_TYPE: "Add question type",
  REMOVE_TYPE: "Remove",
  NO_TYPES_TO_ADD: "Import question types first to add them to this template.",
  SAVE_DRAFT: "Save draft",
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
  TIMING_MODE: "Timing",
  SCORING_METHOD: "Scoring",
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
