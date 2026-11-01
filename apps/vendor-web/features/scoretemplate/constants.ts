import type { BadgeVariant } from "@pte/ui";
import type { ScoreTemplateStatusFilter } from "./types";

export const SCORE_TEMPLATES_QUERY_KEY = ["scoreTemplates"] as const;
export const SCORE_TEMPLATE_QUERY_KEY = ["scoreTemplate"] as const;
export const EXAM_TEMPLATE_BASE_PATH = "/admin/exam-template";
export const EXAM_TEMPLATE_SECTIONS = ["SPEAKING", "WRITING", "READING", "LISTENING"] as const;

export const SCORE_TEMPLATE_SECTION_LABELS = {
  SPEAKING: "Speaking",
  WRITING: "Writing",
  READING: "Reading",
  LISTENING: "Listening",
};

export const SCORE_TEMPLATE_TEXT = {
  LIST_TITLE: "Exam Templates",
  CLONE_ACTION: "Clone to new draft",
  CREATE_ACTION: "Create template",
  DELETE_ACTION: "Delete",
  CREATE_MODAL_TITLE: "Create exam template",
  CODE_LABEL: "Code",
  INFO_TITLE: "Template information",
  TEMPLATE_ACTIONS_LABEL: "Template actions",
  UNSAVED_TITLE: "Leave without saving?",
  UNSAVED_DESCRIPTION:
    "You have unsaved changes to this template. If you leave now, they will be lost.",
  UNSAVED_STAY: "Stay on this page",
  UNSAVED_LEAVE: "Leave without saving",
  NAME_LABEL: "Name",
  POLICY_LABEL: "Template policy",
  STANDARD_POLICY: "Standard PTE",
  CUSTOM_POLICY: "Custom task set",
  CUSTOM_POLICY_NOTICE:
    "Custom templates may use selected task types without requiring the complete standard PTE catalog.",
  CANCEL_ACTION: "Cancel",
  CREATE_ERROR: "Could not create this exam template.",
  DELETE_ERROR: "Could not delete this exam template.",
  DELETE_MODAL_TITLE: "Delete this exam template?",
  DELETE_CONFIRM: "This DRAFT exam template will be permanently deleted. This cannot be undone.",
  DELETE_CANCEL: "Cancel",
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
  TASK_TYPES_LOAD_ERROR:
    "Could not load the active task type catalog. Please refresh before editing.",
  TEMPLATE_READINESS_BLOCKED:
    "This template cannot be activated until every selected task type has a supported active runtime profile. Review the task type catalog and try again.",
  QUESTION_BANK_READINESS_BLOCKED:
    "This template cannot be activated until the question bank contains enough approved questions for every selected task type.",
  READINESS_CHECK_ERROR:
    "The readiness check could not be completed. Refresh before activating this template.",
  WEIGHT_TOTALS_LABEL: "Skill weight totals (must be 100):",
  WEIGHT_TOTAL_MISMATCH: "Skill weights must total exactly 100. Current totals:",
  SAVE_DRAFT: "Save",
  SAVE_ERROR: "Could not save this exam template. Your changes are preserved. Please try again.",
  NAME_REQUIRED: "Enter a template name.",
  READINESS_TITLE: "Cannot activate yet",
  READINESS_SAVED_NOTICE:
    "Question availability is checked against the last saved template. Save your changes to check again.",
  READINESS_LOADING: "Checking question availability...",
  READINESS_EMPTY: "Add at least one task type.",
  READINESS_RUNTIME: "Unavailable task types or runtime profiles",
  READINESS_DUPLICATE: "Repeated task types: keep one configuration per task type",
  READINESS_SHORTAGE: "Insufficient approved questions",
  READINESS_UNKNOWN: "Question availability has not been confirmed. Save and check again.",
  READINESS_POOL_SUMMARY:
    "{count} task type(s) do not have enough approved questions yet. Activation stays blocked until the Available / needed column is complete.",
  POOL_OK: "Enough approved questions for this task type.",
  POOL_SHORT:
    "Not enough approved questions for this task type: {available} available, {required} needed.",
  REQUIRED_COUNT: "Required",
  AVAILABLE_COUNT: "Available",
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

export const SCORE_TEMPLATE_VALIDATION_FAILED_CODE = "SCORE_TEMPLATE_VALIDATION_FAILED";

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
  SKILL_WEIGHT_TOTAL_NOT_100:
    "Could not save: each skill's weight column (Speaking, Writing, Reading, Listening) must total exactly 100. Adjust the weights and save again.",
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
  TASK_TYPE: "Task type",
  POOL: "Available / needed",
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
  QUESTION_COUNT: "Questions",
  TIME_SECONDS: "Time (s)",
} as const;

export const SCORE_TEMPLATE_ROW_TEXT = {
  DRAG_HANDLE: "Drag to reorder",
  ACTIONS_LABEL: "Task type actions",
  EDIT_DETAILS: "Edit details",
  DETAILS_TITLE: "Task type details",
  DETAILS_DONE: "Done",
  PREP: "Prep",
  RESPONSE: "Response",
  SECTION_EMPTY: "No task types in this section yet.",
  NO_SKILL_WEIGHT: "—",
  QUESTIONS_SUFFIX: "questions",
  SKILL_WEIGHTS_HINT: "Skill weights",
} as const;

/**
 * Row grid from `sm` up: task type, timing, overall weight, skill weights, question
 * count (and the actions menu in the editor). The title takes the free width and the
 * small columns stay fixed so they line up from row to row. Literal strings so Tailwind
 * can see them.
 */
export const SCORE_TEMPLATE_ROW_COLUMNS = {
  EDITABLE: "sm:grid-cols-[minmax(0,1fr)_7.5rem_6rem_13rem_12rem_2rem]",
  READ_ONLY: "sm:grid-cols-[minmax(0,1fr)_7.5rem_6rem_13rem_8rem]",
} as const;

/** `ALL` is a tab value, never a section: it lists every section one after another. */
export const SCORE_TEMPLATE_ALL_TAB = "ALL";

/** Which draft field carries each skill's weight; order is the display order of the chips. */
export const SCORE_TEMPLATE_SKILL_WEIGHT_FIELDS = [
  { section: "SPEAKING", field: "speakingWeight" },
  { section: "WRITING", field: "writingWeight" },
  { section: "READING", field: "readingWeight" },
  { section: "LISTENING", field: "listeningWeight" },
] as const;

/** Numeric fields of the details dialog, in the order they are shown. */
export const SCORE_TEMPLATE_DETAIL_FIELDS = [
  { field: "minCount", header: "MIN_COUNT", step: "1" },
  { field: "maxCount", header: "MAX_COUNT", step: "1" },
  { field: "prepSeconds", header: "PREP_SECONDS", step: "1" },
  { field: "responseSeconds", header: "RESPONSE_SECONDS", step: "1" },
  { field: "speakingWeight", header: "SPEAKING_WEIGHT", step: "0.01" },
  { field: "writingWeight", header: "WRITING_WEIGHT", step: "0.01" },
  { field: "readingWeight", header: "READING_WEIGHT", step: "0.01" },
  { field: "listeningWeight", header: "LISTENING_WEIGHT", step: "0.01" },
] as const;

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
