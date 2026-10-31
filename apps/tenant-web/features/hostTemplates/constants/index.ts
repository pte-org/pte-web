import type { SkillName } from "@pte/api-client";

export const HOST_TEMPLATES_QUERY_KEY = "hostExamTemplates";
export const HOST_TEMPLATES_ROUTE = "/host/exam-templates";

/** Totals are decimals (e.g. 62.50), so compare with a tolerance instead of `===`. */
export const WEIGHT_TOLERANCE = 0.005;
export const FULL_SKILL_WEIGHT = 100;

export const SKILLS: readonly SkillName[] = ["SPEAKING", "WRITING", "READING", "LISTENING"];

export const SKILL_LABELS: Record<SkillName, string> = {
  SPEAKING: "Speaking",
  WRITING: "Writing",
  READING: "Reading",
  LISTENING: "Listening",
};

export type RedistributionMode = "PROPORTIONAL" | "EQUAL" | "MANUAL";
export const DEFAULT_REDISTRIBUTION_MODE: RedistributionMode = "PROPORTIONAL";

export const HOST_TEMPLATES_TEXT = {
  TITLE: "Exam templates",
  CREATE: "New template",
  CREATE_TITLE: "New template from the default",
  CREATE_HINT:
    "A new template starts as a copy of the default template. You can then remove task types and adjust the weights.",
  NAME_LABEL: "Template name",
  NAME_PLACEHOLDER: "e.g. Reading and Listening only",
  COL_NAME: "Name",
  COL_STATUS: "Status",
  COL_TASKS: "Task types",
  COL_ACTIONS: "Actions",
  EMPTY_TITLE: "No templates yet",
  EMPTY_TEXT: "Create a template from the default one to choose which task types an exam contains.",
  LOAD_FAILED: "Failed to load templates.",
  OPEN: "Open",
  CLONE: "Duplicate",
  ACTIVATE: "Activate",
  RETIRE: "Retire",
  DELETE: "Delete",
  CANCEL: "Cancel",
  CREATE_SUBMIT: "Create",
  CONFIRM_DELETE_TITLE: "Delete this draft?",
  CONFIRM_DELETE_TEXT: "The draft will be removed permanently.",
  CONFIRM_RETIRE_TITLE: "Retire this template?",
  CONFIRM_RETIRE_TEXT:
    "It can no longer be chosen for new exams. Exams that already use it are not affected.",
  CONFIRM_ACTIVATE_TITLE: "Activate this template?",
  CONFIRM_ACTIVATE_TEXT:
    "Once activated, the template appears in the list you choose from when you create an exam. It is not applied to exams automatically.",
  ACTION_FAILED: "We couldn't complete this action. Please try again.",
  ACTIVATE_POOL_SHORT:
    "Can't activate yet: some task types don't have enough approved questions. Open the template and check the Available / needed column, or remove those task types.",
  ACTIVATE_WEIGHTS_INVALID:
    "Can't activate: each skill's weights must total exactly 100. Open the template and adjust the weights.",
  STATUS_DRAFT: "Draft",
  STATUS_ACTIVE: "Available",
  STATUS_RETIRED: "Retired",
  STATUS_PENDING_APPROVAL: "Pending",
  DEFAULT_BADGE: "Default",
  DEFAULT_HINT: "Provided by the platform. Choose it when creating an exam, or create a new template from it.",
} as const;

export const EDITOR_TEXT = {
  BACK: "Back to templates",
  NOT_FOUND: "Template not found.",
  READ_ONLY: "Only a draft can be edited. Duplicate this template to change it.",
  DEFAULT_READ_ONLY:
    "This is the platform default template and cannot be edited. You can choose it when creating an exam, or create a new template from it to remove task types.",
  NAME_LABEL: "Template name",
  TASKS_TITLE: "Task types",
  TASKS_HINT:
    "You can remove task types and adjust weights. Task types outside the default template cannot be added.",
  COL_TASK: "Task type",
  COL_COUNT: "Questions",
  COL_POOL: "Available / needed",
  POOL_OK: "Enough published questions for this task type.",
  POOL_SHORT:
    "Not enough published questions for this task type: {available} available, {required} needed.",
  POOL_SUMMARY:
    "{count} task type(s) do not have enough questions yet. You can still save the draft, but activation is blocked until they do.",
  WEIGHT_LOCKED:
    "The default template gives this task type no weight for this skill, so it cannot be changed.",
  REMOVE: "Remove",
  NO_TASKS: "A template needs at least one task type.",
  SAVE: "Save",
  SAVING: "Saving...",
  SAVED: "Template saved.",
  ACTIVATED: "Template activated.",
  SAVE_FIRST: "Save your changes before activating.",
  WEIGHTS_INVALID:
    "Each skill's weights must total 100 (a skill with no tasks of its own may stay at 0). Check:",
  OVERALL_ZERO: "At least one skill must carry weight.",
  BALANCE: "Balance weights",
  BALANCE_TITLE: "Balance skill weights",
  BALANCE_INTRO:
    "Removing a task type leaves a gap in the skill totals. Choose how to fill it. Nothing changes until you apply.",
  BALANCE_ALREADY: "All skills already total 100 (or 0). Nothing to balance.",
  APPLY: "Apply",
  CLOSE: "Close",
  SUGGEST_FAILED: "Could not compute a suggestion.",
  MANUAL_NOTE: "Close this dialog and edit the weights in the table yourself.",
} as const;

export const MODE_TEXT: Record<RedistributionMode, { label: string; hint: string }> = {
  PROPORTIONAL: {
    label: "Keep the old ratio",
    hint: "Recommended. The missing points are shared out in the same proportions the remaining tasks already had.",
  },
  EQUAL: {
    label: "Split equally",
    hint: "Every remaining task of the skill receives the same number of extra points.",
  },
  MANUAL: {
    label: "Adjust by hand",
    hint: "Nothing is changed for you. Edit the weights in the table until each skill totals 100.",
  },
};
