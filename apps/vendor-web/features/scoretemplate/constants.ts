import type { BadgeVariant } from "@pte/ui";
import type { ScoreTemplateStatusFilter } from "./types";

export const SCORE_TEMPLATES_QUERY_KEY = ["scoreTemplates"] as const;
export const SCORE_TEMPLATE_QUERY_KEY = ["scoreTemplate"] as const;
export const EXAM_TEMPLATE_BASE_PATH = "/admin/exam-template";
export const EXAM_TEMPLATE_SECTIONS = ["SPEAKING", "WRITING", "READING", "LISTENING"] as const;

export const SCORE_TEMPLATE_TEXT = {
  LIST_TITLE: "Exam Templates",
  LIST_SUBTITLE:
    "Manage the PTE question distribution, timing, and scoring templates used to build exams.",
  CLONE_ACTION: "Clone to new draft",
  CREATE_ACTION: "Create template",
  DELETE_ACTION: "Delete",
  CREATE_MODAL_TITLE: "Create exam template",
  CREATE_MODAL_SUBTITLE: "Create an empty DRAFT and add question types in the editor.",
  CODE_LABEL: "Code",
  NAME_LABEL: "Name",
  CANCEL_ACTION: "Cancel",
  CREATE_ERROR: "Could not create this exam template.",
  DELETE_ERROR: "Could not delete this exam template.",
  DELETE_CONFIRM: "Delete this DRAFT exam template? This cannot be undone.",
  DETAIL_BACK: "Back to list",
  VIEW_ACTION: "View",
  EDIT_ACTION: "Edit",
  EXPORT_ACTION: "Export JSON",
  ADD_TYPE: "Add question type",
  ADD_SECTION_PLACEHOLDER: "Select section first",
  ADD_TYPE_PLACEHOLDER: "Select a question type",
  NO_SECTION_SELECTED: "Select a section first",
  DRAFT_STATUS_LABEL: "DRAFT",
  REMOVE_TYPE: "Remove",
  NO_TYPES_TO_ADD: "No active question types are available in this section.",
  SAVE_DRAFT: "Save",
  ACTIVATE_ACTION: "Activate",
  SUBMIT_APPROVAL_ACTION: "Submit for review",
  APPROVE_ACTION: "Approve",
  REJECT_ACTION: "Return for changes",
  REJECT_MODAL_TITLE: "Return template for changes",
  REJECT_REASON_LABEL: "Reason for returning",
  REJECT_REASON_PLACEHOLDER: "Explain what the author should update.",
  REJECT_REASON_REQUIRED: "Add a short reason before returning this template.",
  REJECT_CONFIRM: "Return for changes",
  REJECT_CANCEL: "Cancel",
  APPROVAL_SUBMITTED: "Template submitted for platform admin review.",
  APPROVAL_APPROVED: "Template approved and returned to draft for activation.",
  APPROVAL_REJECTED: "Template returned to the author with your feedback.",
  REJECTION_FEEDBACK_LABEL: "Review feedback",
  ACTIVATE_MODAL_TITLE: "Activate this template?",
  ACTIVATE_MODAL_WARNING:
    "The current ACTIVE template will be retired immediately. Every new exam published from now on uses this template's weights and timing — exams already published keep the template they were published with.",
  ACTIVATE_CONFIRM: "Activate",
  ACTIVATE_CANCEL: "Cancel",
  NOT_DRAFT_ERROR:
    "This template is no longer editable — it stopped being a DRAFT (e.g. someone else activated a newer version). Reload the list to see the current state.",
  CONCURRENT_MODIFICATION_ERROR:
    "Another admin changed this template's family at the same moment. Reload and try again.",
  LOAD_ERROR: "Could not load exam templates. Please refresh.",
  CLONE_ERROR: "Could not clone this template. Please try again.",
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
  PENDING_APPROVAL: "Pending approval",
  DRAFT: "Draft",
  RETIRED: "Retired",
};

export const SCORE_TEMPLATE_STATUS_VARIANT: Record<ScoreTemplateStatusFilter, BadgeVariant> = {
  ACTIVE: "success",
  PENDING_APPROVAL: "info",
  DRAFT: "warning",
  RETIRED: "neutral",
};
