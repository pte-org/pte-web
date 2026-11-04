import { EXAM_TEMPLATE_SECTIONS } from "../scoretemplate/constants";

export const EXAM_STUDIO_ROUTE = "/admin/exam-studio";
export const QUESTION_ROUTE = "/admin/questions";
export const QUESTION_TYPES_ROUTE = "/admin/question-types";
export const NEW_QUESTION_ROUTE = `${QUESTION_ROUTE}/new`;

export const STUDIO_SECTIONS = EXAM_TEMPLATE_SECTIONS;

/** A task type with at least this share of the questions it needs counts as "short", below it as "missing". */
export const STUDIO_SHORT_RATIO = 0.5;
export const STUDIO_PERCENT_SCALE = 100;
export const STUDIO_QUESTION_PAGE_SIZE = 20;
/** How long a search stays quiet before it is sent, so typing does not send a request per key. */
export const STUDIO_SEARCH_DELAY_MS = 300;
export const STUDIO_MAX_COUNT_LIMIT = 20;
export const STUDIO_PREP_OPTIONS_SECONDS = [3, 10, 20, 25, 30, 35, 40] as const;
export const STUDIO_RESPONSE_OPTIONS_SECONDS = [10, 15, 40, 60, 90, 120, 600, 1200] as const;
export const SECONDS_PER_MINUTE = 60;
export const STUDIO_TIMELINE_COLUMNS = 12;
/** Cards a board column loads at first, and how many more each "show more" adds. */
export const KANBAN_COLUMN_PAGE_SIZE = 20;
/** The most cards one column loads; past it the filters narrow the board down. */
export const KANBAN_COLUMN_MAX_SIZE = 200;

export const STUDIO_TABS = {
  COVERAGE: "coverage",
  KANBAN: "kanban",
  COMPOSE: "compose",
  TIMELINE: "timeline",
} as const;

export const EXAM_STUDIO_TEXT = {
  TEMPLATE_LABEL: "Working template",
  NO_TEMPLATE_TITLE: "No platform template yet",
  NO_TEMPLATE_BODY: "Create a draft from the exam template page to start.",
  READ_ONLY_NOTICE: "This version is locked. Create a new draft to change it.",
  CREATE_DRAFT: "Create a new draft",
  CREATE_DRAFT_ERROR: "Could not create a draft from this template.",
  READY_TITLE: "{ready} of {total} task types are ready",
  ALL_READY_TITLE: "The template is ready to activate",
  MISSING_QUESTIONS: "{count} approved questions are still missing",
  OUTSIDE_TEMPLATE: "{count} task types are not in the template yet",
  ALL_READY_BODY: "Every task type has enough approved questions.",
  OPEN_TEMPLATE_PAGE: "Open the template page",
  TEMPLATE_VERSION: "Template version",
  WRITE_MISSING: "Write the missing questions",
  ACTIVATE_ON_TEMPLATE_PAGE: "Activate on the template page",
  SWITCH_TO_DRAFT: "Switch to the draft",
  LOCKED_HAS_DRAFT: "This version is in effect and locked. Make changes in the draft.",
  LEGEND_READY: "Enough approved questions",
  LEGEND_SHORT: "A few short",
  LEGEND_MISSING: "Many missing",
  LEGEND_OUTSIDE: "Not in the template",
  QUESTIONS_SUFFIX: "questions",
  OUTSIDE_BADGE: "not in template",
  LOAD_ERROR: "Could not load the studio data.",
  DRAWER_DESCRIPTION: "Where this task type stands in the template, and its questions",
  QUESTIONS_SECTION: "Question bank",
  IN_TEMPLATE: "In the template",
  IN_TEMPLATE_OFF: "This task type is not in the template yet. Add it on the template page.",
  ADD_TO_TEMPLATE: "Add to the template",
  REMOVE_FROM_TEMPLATE: "Remove from the template",
  CANNOT_REMOVE_WEIGHTED:
    "This task type carries skill weight. Rebalance the weights on the template page before removing it.",
  QUESTION_COUNT: "Questions per exam",
  MIN_COUNT_NOTE: "Minimum {count}",
  PREP_TIME: "Preparation time",
  RESPONSE_TIME: "Response time",
  POOL_ENOUGH: "Enough approved questions: {available} available.",
  POOL_SHORT: "Only {available} approved questions, {missing} more needed. Open the Questions tab.",
  SAVE_ERROR: "Could not save the template.",
  QUESTIONS_HEADING: "{approved} approved, {pending} not yet",
  COMPOSE_QUESTION: "Compose a question",
  NO_QUESTIONS: "No questions yet for this task type.",
  QUESTIONS_ERROR: "Could not load the questions.",
  SUBMIT_APPROVAL: "Submit",
  APPROVE: "Approve",
  ACTION_ERROR: "Could not update the question.",
  STATUS_DRAFT: "Draft",
  STATUS_PENDING: "Awaiting approval",
  STATUS_PUBLISHED: "Approved",
  STATUS_ARCHIVED: "Archived",
  FILTER_ALL: "All",
  QUESTION_SEARCH: "Search questions in this task type",
  FOOTER_NOTE: "Changes are saved as you make them.",
  DECREASE: "Fewer",
  INCREASE: "More",
  TABS_LABEL: "Content Hub views",
  TAB_COVERAGE: "Coverage map",
  TAB_KANBAN: "Approval workflow",
  TAB_COMPOSE: "Compose with preview",
  TAB_TIMELINE: "Exam timeline",
  KANBAN_ALL_TYPES: "All task types",
  KIND_LABEL: "Board of",
  KIND_QUESTIONS: "Question bank",
  KIND_TASK_TYPES: "Task types",
  KIND_TEMPLATES: "Exam templates",
  BOARD_LOAD_ERROR: "Could not load the board.",
  TEMPLATE_TASK_TYPES: "{count} task types",
  FILTER_ALL_SECTIONS: "All sections",
  FILTER_CEFR: "CEFR",
  FILTER_ALL_SCORING: "All scoring modes",
  FILTER_SCORED: "Scored",
  FILTER_UNSCORED: "Not scored",
  APPROVE_ACTIVATE: "Approve and activate",
  APPROVED_NOT_ACTIVATED: "Approved, but it could not be activated:",
  KANBAN_DRAG: "Drag to the next step",
  KANBAN_MORE: "Show {count} more",
  KANBAN_LIMIT: "Showing the first 200. Narrow the board with the filters.",
  KANBAN_LOAD_ERROR: "Could not load the question board.",
  EMPTY_COLUMN: "Nothing here",
  MOVE_NOT_ALLOWED: "A question moves one step at a time: draft, awaiting approval, approved.",
  MOVE_NEEDS_REVIEWER: "Only an academic manager can approve a question.",
  LOCKED_NEEDS_REVIEWER: "Only an academic manager can approve",
  UPDATED: "Updated {time}",
  PENDING_REVIEW: "{count} questions are waiting for your review",
  OPEN_BOARD: "Open the board",
  MOVE_DONE: "Question updated",
  COMPOSE_HINT: "Fill in the form; the preview shows what the student will see.",
  COMPOSE_SAVED: "Question saved as a draft",
  PREVIEW_TITLE: "Student view",
  PREVIEW_PLACEHOLDER: "Start typing to see the question.",
  PREVIEW_PREP: "Preparation: {seconds}s",
  PREVIEW_RESPONSE: "Response: {seconds}s",
  PREVIEW_NO_TEMPLATE_TIME: "Add this task type to the template to see its timing.",
  TIMELINE_HINT: "The width of a block follows its time. Click one to see its task type.",
  TIMELINE_TOTAL: "About {minutes} minutes in {count} task types",
  TIMELINE_EMPTY: "No task types in this template yet.",
  TIMELINE_BLOCK: "{count} q · {time}",
  TIMELINE_LANE_EMPTY: "Nothing in this skill",
  PICKER_TITLE: "Choose templates",
  PICKER_SEARCH: "Search by name, code or version",
  PICKER_HINT: "Pick the template to look at: the active one or a draft.",
  PICKER_TASK_TYPES: "task types",
  PICKER_EMPTY: "No template matches.",
  PICKER_MORE: "Show {count} more",
  PICKER_DONE: "Done",
  VIEW_TEMPLATE: "View",
  DISTINCT_EXAMS: "About {count} exams without a repeated question",
  AVOID_REPEATS: "No repeated questions between exams",
  AVOID_REPEATS_HINT:
    "Tick to see how many exams the approved questions can fill without any question appearing twice.",
  DISTINCT_EXAMS_SHORT: "≈ {count} exams",
  DISTINCT_EXAMS_NONE: "Not enough for even one exam",
  GAPS_TITLE: "To do: questions to write",
  GAPS_ITEM: "{count} more needed",
  WRITE_MORE: "Write more",
} as const;
