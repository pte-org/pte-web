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
  CREATE_MODAL_SUBTITLE:
    "Create an empty DRAFT, choose its policy, and add task types from the platform catalog.",
  CODE_LABEL: "Code",
  NAME_LABEL: "Name",
  POLICY_LABEL: "Template policy",
  STANDARD_POLICY: "Standard PTE",
  CUSTOM_POLICY: "Custom task set",
  CUSTOM_POLICY_NOTICE:
    "Custom templates may use selected task types without requiring the complete standard PTE catalog.",
  CANCEL_ACTION: "Cancel",
  CREATE_ERROR: "Could not create this exam template.",
  DELETE_ERROR: "Could not delete this exam template.",
  DELETE_CONFIRM: "Delete this DRAFT exam template? This cannot be undone.",
  DETAIL_BACK: "Back to list",
  VIEW_ACTION: "View",
  EDIT_ACTION: "Edit",
  EXPORT_ACTION: "Export JSON",
  ADD_TYPE: "Add task type",
  ADD_SECTION_PLACEHOLDER: "Select section first",
  ADD_TYPE_PLACEHOLDER: "Select a task type",
  NO_SECTION_SELECTED: "Select a section first",
  DRAFT_STATUS_LABEL: "DRAFT",
  REMOVE_TYPE: "Remove",
  NO_TYPES_TO_ADD: "No active task types are available in this section.",
  NO_ACTIVE_TASK_TYPES:
    "No active task types are available in the platform catalog. Ask a platform administrator to enable the standard catalog before editing this template.",
  ALL_ACTIVE_TYPES_USED:
    "All active task types in this section are already in the template. Choose another section or remove one before adding it again.",
  INCOMPATIBLE_RUNTIME_PROFILE:
    "The available task types in this section are not compatible with the current app runtime. Ask the platform team to release support before using them.",
  TASK_TYPE_CATALOG_NOTICE:
    "Task types come from the active platform catalog. Their screen, authoring, and scoring behavior comes from the released runtime contract.",
  TASK_TYPES_LOAD_ERROR:
    "Could not load the active task type catalog. Please refresh before editing.",
  TEMPLATE_READINESS_BLOCKED:
    "This template cannot be activated until every selected task type has a supported active runtime profile. Review the task type catalog and try again.",
  QUESTION_BANK_READINESS_BLOCKED:
    "This template cannot be activated until the question bank contains enough approved questions for every selected task type.",
  READINESS_CHECK_ERROR:
    "The readiness check could not be completed. Refresh before activating this template.",
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

export const SCORE_TEMPLATE_ERROR_MESSAGES: Record<string, string> = {
  SCORE_TEMPLATE_NOT_FOUND:
    "This exam template could not be found. Refresh the list and try again.",
  SCORE_TEMPLATE_NOT_DRAFT:
    "This template version is locked. Clone it to create a new editable version.",
  SCORE_TEMPLATE_CONCURRENT_MODIFICATION:
    "Another platform user changed this template. Refresh the page and review your changes again.",
  SCORE_TEMPLATE_PENDING_APPROVAL: "This template is already awaiting platform admin review.",
  SCORE_TEMPLATE_VALIDATION_FAILED:
    "This template is not ready yet. Review the selected task types, counts, timing, and skill weights.",
  TASK_RUNTIME_PROFILE_NOT_FOUND:
    "One selected task type has no runtime profile. Ask the platform team to enable it before activating this template.",
  TASK_RUNTIME_PROFILE_NOT_ACTIVE:
    "One selected task type is retired for new templates. Choose an active standard task type.",
  TASK_RUNTIME_PROFILE_NOT_ALLOWED:
    "One selected task type uses a runtime profile that the platform no longer supports. Ask the platform team to release support.",
  RUNTIME_PROFILE_NOT_PINNED:
    "This template is missing runtime information for one task type. Save it again or ask the platform team to repair the template.",
  RUNTIME_PROFILE_INVALID:
    "One task type has an invalid runtime configuration. Ask the platform team to repair the catalog before activating this template.",
  SCORING_PROFILE_INVALID:
    "One task type has an incompatible scoring configuration. Ask the platform team to publish a compatible template.",
  UNKNOWN_TASK_TYPE:
    "This template contains a task type the platform no longer recognizes. Refresh the catalog before continuing.",
  ACCESS_DENIED: "You do not have permission to perform this template action.",
};

export const SCORE_TEMPLATE_LIST_HEADERS = {
  CODE: "Code",
  VERSION: "Version",
  NAME: "Name",
  STATUS: "Status",
  ITEMS: "Items",
  POLICY: "Policy",
  ACTIONS: "Actions",
} as const;

export const SCORE_TEMPLATE_POLICY_LABELS = {
  STANDARD_PTE: "Standard PTE",
  CUSTOM: "Custom task set",
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
