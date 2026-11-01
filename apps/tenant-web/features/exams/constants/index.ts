import type {
  ExamMode,
  LockdownMode,
  ProctorRole,
  ReusePolicy,
  SessionStatus,
} from "@pte/api-client";
import type { CreateSessionInput, ExamSkill } from "../types";

export * from "./answers";

// react-query cache-key roots — named constants per this repo's established
// convention (avoids raw-string query-key drift/collisions).
export const SESSIONS_QUERY_KEY = ["sessions"] as const;
export const SESSION_QUERY_KEY = ["session"] as const;
export const ENROLLMENTS_QUERY_KEY = ["enrollments"] as const;
export const PROCTOR_ASSIGNMENTS_QUERY_KEY = ["proctorAssignments"] as const;
export const TENANT_USERS_QUERY_KEY = ["tenantUsers"] as const;
export const EXAM_PREVIEW_QUERY_KEY = ["examPreview"] as const;
export const EXAMINER_ASSIGNMENT_ROSTER_QUERY_KEY = ["examinerAssignmentRoster"] as const;
export const EXAMINER_DIRECTORY_QUERY_KEY = ["examinerAssignmentDirectory"] as const;
/** Each student sits an exam once, as in the real test; the API refuses any other retry count. */
export const SINGLE_SITTING_RETRIES = 0;

export const HOST_SCORE_REVIEW_QUERY_KEY = ["hostScoreReview"] as const;
export const SCORE_SOURCE_AUDIT_QUERY_KEY = ["scoreSourceAuditHistory"] as const;
export const REPORT_PUBLICATION_READINESS_QUERY_KEY = ["reportPublicationReadiness"] as const;
export const REPORT_PUBLICATION_SUMMARY_QUERY_KEY = ["reportPublicationSummary"] as const;

export const EXAMS_TEXT = {
  TITLE: "Exams",
  ADD_EXAM: "Create Exam",
  EMPTY_TITLE: "No exams yet",
  EMPTY_TEXT: "Create your first exam session to start adding students.",
} as const;

export const EXAM_TABLE_HEADERS = {
  NAME: "Exam Name",
  CODE: "Code",
  CONFIGURATION: "Configuration",
  STATUS: "Status",
  OPENS_AT: "Opens",
  CLOSES_AT: "Closes",
  ACTIONS: "Actions",
} as const;

export const EXAM_ROW_ACTIONS_TEXT = {
  VIEW: "View details",
  UPDATE_STATUS: "Update status",
  CANCEL_UPDATE_STATUS: "Cancel status update",
  DELETE: "Delete exam",
  DELETE_TITLE: "Delete this exam draft?",
  DELETE_DESCRIPTION: (name: string) =>
    `The draft “${name}” will be deleted and cannot be recovered.`,
  DELETE_CONFIRM: "Delete exam",
  CANCEL: "Cancel",
  DELETE_SUCCESS: "Exam draft deleted.",
  DELETE_FAILED: "Unable to delete the exam draft. Please try again.",
  UPDATE_STATUS_TITLE: (name: string) => `Update the status of "${name}"?`,
  UPDATE_STATUS_DESCRIPTION: (name: string, current: string, next: string) =>
    `"${name}" will move from ${current} to ${next}.`,
  UPDATE_STATUS_CONFIRM: "Update status",
  UPDATE_STATUS_SUCCESS: "Exam status updated.",
  UPDATE_STATUS_FAILED: "Unable to update the exam status. Please try again.",
} as const;

export const SESSION_STATUS_LABELS = {
  DRAFT: "Draft",
  READY: "Ready to publish",
  SCHEDULED: "Scheduled",
  OPEN: "In progress",
  CLOSED: "Closed",
  CANCELLED: "Cancelled",
} as const;

/**
 * Statuses exposed by the edit form. Transitions are backed by the exam
 * orchestration/lifecycle commands, not by an arbitrary status PATCH.
 */
export const SESSION_STATUS_TRANSITIONS = {
  DRAFT: ["DRAFT", "READY", "SCHEDULED"],
  READY: ["READY", "SCHEDULED", "CANCELLED"],
  SCHEDULED: ["SCHEDULED", "OPEN", "CANCELLED"],
  OPEN: ["OPEN", "CLOSED"],
  CLOSED: ["CLOSED"],
  CANCELLED: ["CANCELLED"],
} as const satisfies Record<SessionStatus, readonly SessionStatus[]>;

export const SESSION_STATUS_FILTER_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "DRAFT", label: SESSION_STATUS_LABELS.DRAFT },
  { value: "READY", label: SESSION_STATUS_LABELS.READY },
  { value: "SCHEDULED", label: SESSION_STATUS_LABELS.SCHEDULED },
  { value: "OPEN", label: SESSION_STATUS_LABELS.OPEN },
  { value: "CLOSED", label: SESSION_STATUS_LABELS.CLOSED },
  { value: "CANCELLED", label: SESSION_STATUS_LABELS.CANCELLED },
] as const;

export const SESSION_STATUS_VARIANT = {
  DRAFT: "warning",
  READY: "success",
  SCHEDULED: "info",
  OPEN: "success",
  CLOSED: "neutral",
  CANCELLED: "danger",
} as const;

export const CREATE_SESSION_TEXT = {
  TITLE: "Create Exam",
  SECTION_CONTENT: "Exam Content",
  NAME_LABEL: "Exam name",
  NAME_PLACEHOLDER: "e.g. Mid-term PTE Mock Test",
  SUBSCRIPTION_LABEL: "Subscription",
  SUBSCRIPTION_PLACEHOLDER: "Select an active subscription",
  PLAN_FALLBACK: "Plan",
  SUBSCRIPTION_OPTION: (planName: string, licenseKey: string) => `${planName} — ${licenseKey}`,
  NO_ACTIVE_SUBSCRIPTIONS:
    "No active subscription yet — buy a plan or contact PTEPrep for a contract grant.",
  SKILLS_LABEL: "Skills",
  OPENS_AT_LABEL: "Opens at",
  CLOSES_AT_LABEL: "Closes at",
  CAPACITY_LABEL: "Capacity",
  CAPACITY_PLACEHOLDER: "e.g. 30",
  CANCEL: "Cancel",
  SUBMIT: "Create Exam",
  SUBMITTING: "Creating...",
} as const;

export const CREATE_EXAM_WIZARD_TEXT = {
  TITLE: "Create exam",
  STEP_DETAILS: "Exam details",
  STEP_SCHEDULE_POLICY: "Schedule & policy",
  STEP_AUDIENCE: "Audience",
  STEP_REVIEW: "Review & create",
  NAME_LABEL: "Exam name",
  NAME_PLACEHOLDER: "e.g. Semester 1 mock exam",
  TEMPLATE_LABEL: "Exam template",
  TEMPLATE_PLACEHOLDER: "Select an active template",
  DEFAULT_TEMPLATE_TAG: "default",
  TEMPLATE_PICK_HINT: "Choose which task types this exam contains. The default template contains all of them; your own templates contain the ones you kept.",
  PLAN_FALLBACK: "Plan",
  SUBSCRIPTION_LABEL: "Subscription",
  SUBSCRIPTION_PLACEHOLDER: "Select an active subscription",
  OPENS_AT_LABEL: "Opens at",
  CLOSES_AT_LABEL: "Closes at",
  CAPACITY_LABEL: "Maximum students",
  SUBSCRIPTION_CAPACITY_HINT: "This subscription allows up to {count} students per exam.",
  FULL_TEMPLATE_SCOPE: "Full template scope",
  RETRIES_LABEL: "Allowed retries per student",
  REUSE_POLICY_LABEL: "Student reuse rule",
  SERIES_LABEL: "Exam series",
  SERIES_PLACEHOLDER: "e.g. 2026-HK1",
  SOURCES_TITLE: "Students taking the exam",
  SOURCE_SEARCH_LABEL: "Search students",
  SOURCE_SEARCH_PLACEHOLDER: "Search by name, email, account, or code",
  FILTER_PROGRAM_LABEL: "Program",
  FILTER_CLASS_LABEL: "Class",
  FILTER_ALL_PROGRAMS: "All programs",
  FILTER_ALL_CLASSES: "All classes",
  FILTER_NO_CLASS: "Not in any class",
  SELECT_ALL_FILTERED: "Select all students in this list",
  SELECT_STUDENT: "Select student",
  NO_CLASS_BADGE: "No class",
  CLEAR_SELECTION: "Clear selection",
  SELECTED_TOTAL: "{count} students selected",
  SELECTED_IN_LIST: "{selected} of {total} in this list",
  SOURCE_LOADING: "Loading students...",
  SOURCE_EMPTY: "No students match your filters.",
  MANAGE_CLASSES: "Manage classes",
  NO_SOURCES: "Select at least one student.",
  NO_TEMPLATE:
    "No active exam template is available yet. Ask the platform administrator to activate one.",
  NO_ACTIVE_SUBSCRIPTIONS: "No active subscription is available for this exam.",
  REVIEW_TITLE: "Review before generation",
  REVIEW_TEMPLATE: "Template",
  REVIEW_SKILLS: "Included skills",
  REVIEW_RETRIES: "Retries per student",
  REVIEW_AUDIENCE: "Students",
  REVIEW_CAPACITY: "Maximum students",
  EMPTY_VALUE: "—",
  TEMPLATE_READY: "The template has enough published questions.",
  PREFLIGHT_SHORTAGE_DETAILS:
    "{taskType}: requires {required} published question(s); available: {available}.",
  TEMPLATE_NOT_READY: "The question bank does not yet have enough questions for this template.",
  BACK: "Back",
  NEXT: "Continue",
  REVIEW_AND_CREATE: "Review & create",
  CANCEL: "Cancel",
  SUBMIT: "Generate and publish",
  SUBMITTING: "Preparing exam...",
  PREFLIGHT_BLOCKED:
    "Some requirements are not ready. Review the audience and question-bank warnings.",
  PREFLIGHT_ISSUE_MESSAGES: {
    TEMPLATE_POOL_INSUFFICIENT: "The selected template does not have enough published questions.",
    SESSION_SUBSCRIPTION_NOT_FOUND: "The selected subscription is no longer active.",
    SESSION_WINDOW_OUTSIDE_SUBSCRIPTION: "The exam window must fit within the subscription period.",
    SESSION_TIME_CONFLICT: "The subscription already has another exam in this time window.",
    AUDIENCE_EMPTY: "No students were found from the selected audience sources.",
    AUDIENCE_NO_ELIGIBLE: "No students remain eligible after applying the reuse rule.",
    AUDIENCE_CONFLICT_BLOCKED: "Some students have a schedule conflict with another exam.",
    AUDIENCE_CHANGED_REQUIRES_REGENERATION:
      "The student audience changed while the exam was being prepared. Generate the exam again before publishing.",
    SESSION_CAPACITY_EXCEEDED:
      "The audience is larger than the capacity allowed by the subscription.",
  } as Record<string, string>,
  SUCCESS: "Exam generated and scheduled successfully.",
  MODE_REAL: "Official exam",
  POLICY_OFFICIAL_STRICT: "Official — strict",
  POLICY_LEGACY: "Previously created exam",
  POLICY_UNAVAILABLE: "Security policy unavailable — review required",
  REUSE_ALLOW: "Allow previous attempts",
  REUSE_STARTED: "Exclude students who already started this series",
  REUSE_ASSIGNED: "Exclude students already assigned in this series",
  REUSE_OVERLAP: "Block overlapping exam schedules",
} as const;

export const CREATE_EXAM_WIZARD_ERRORS = {
  NAME_REQUIRED: "Enter an exam name.",
  TEMPLATE_REQUIRED: "Select an active exam template.",
  SUBSCRIPTION_REQUIRED: "Select an active subscription.",
  OPENS_REQUIRED: "Choose when the exam opens.",
  CLOSES_REQUIRED: "Choose when the exam closes.",
  CLOSES_AFTER_OPENS: "The close time must be after the open time.",
  CAPACITY_REQUIRED: "Enter a positive whole-number capacity.",
  CAPACITY_EXCEEDS_PLAN: "Capacity exceeds the selected subscription's student limit.",
  AUDIENCE_EXCEEDS_CAPACITY: "The selected students exceed this exam's capacity.",
  SERIES_REQUIRED: "Add an exam series for this reuse rule.",
  AUDIENCE_REQUIRED: "Select at least one student.",
  OPEN_FUTURE: "Choose an opening time in the future.",
  RETRIES_INVALID: "Enter a whole number of retries from 0 to 9.",
  POLICY_MISMATCH:
    "The server returned a different security policy. Refresh the exam settings and try again.",
} as const;

/** Every host-created exam is official; the server enforces STRICT lockdown for it. */
export const OFFICIAL_EXAM_MODE: ExamMode = "OFFICIAL_EXAM";
export const OFFICIAL_EXAM_LOCKDOWN_MODE: LockdownMode = "STRICT";

export const EXAM_MODE_LABELS: Record<ExamMode, string> = {
  OFFICIAL_EXAM: CREATE_EXAM_WIZARD_TEXT.MODE_REAL,
};

export const REUSE_POLICY_OPTIONS: { value: ReusePolicy; label: string }[] = [
  { value: "ALLOW", label: CREATE_EXAM_WIZARD_TEXT.REUSE_ALLOW },
  { value: "EXCLUDE_STARTED_IN_SERIES", label: CREATE_EXAM_WIZARD_TEXT.REUSE_STARTED },
  { value: "EXCLUDE_ASSIGNED_IN_SERIES", label: CREATE_EXAM_WIZARD_TEXT.REUSE_ASSIGNED },
  { value: "BLOCK_ON_SCHEDULE_OVERLAP", label: CREATE_EXAM_WIZARD_TEXT.REUSE_OVERLAP },
];

/** Select value meaning "no filter" in the audience program/class filters. */
export const AUDIENCE_FILTER_ALL = "";
/** Select value for students who have no class membership yet. */
export const AUDIENCE_FILTER_NO_CLASS = "__NO_CLASS__";

export const EXAM_SKILL_OPTIONS: { value: ExamSkill; label: string }[] = [
  { value: "SPEAKING", label: "Speaking" },
  { value: "WRITING", label: "Writing" },
  { value: "READING", label: "Reading" },
  { value: "LISTENING", label: "Listening" },
];

export const CREATE_SESSION_ERRORS = {
  NAME_REQUIRED: "Exam name is required.",
  SUBSCRIPTION_REQUIRED: "Select a subscription.",
  SKILLS_REQUIRED: "Select at least 1 skill (up to 4).",
  OPENS_AT_REQUIRED: "Opens-at date/time is required.",
  OPENS_AT_FUTURE: "Opens-at must be in the future.",
  CLOSES_AT_REQUIRED: "Closes-at date/time is required.",
  CLOSES_AT_AFTER_OPENS: "Closes-at must be after opens-at.",
  CAPACITY_REQUIRED: "Capacity is required.",
  CAPACITY_POSITIVE: "Capacity must be a positive whole number.",
} as const;

export const EMPTY_CREATE_SESSION: CreateSessionInput = {
  name: "",
  subscriptionPublicId: "",
  skills: [],
  opensAt: "",
  closesAt: "",
  capacity: "",
};

export const SESSION_DETAIL_TEXT = {
  BACK: "Back to Exams",
  SESSION_CODE_SECTION: "Exam code",
  COPY_SESSION_CODE: "Copy code",
  SESSION_CODE_COPIED: "Exam code copied.",
  SESSION_CODE_COPY_FAILED: "Could not copy the exam code. Select the code and copy it manually.",
  VIEW_EXAM: "View Exam",
  OPEN_EXAM: "Open Exam",
  CLOSE_EXAM: "Close Exam",
  CLOSE_EXAM_CONFIRM_CUTOFF:
    "Close this exam now? Students who are still working will no longer be able to submit answers. You must close the session before publishing results.",
  CANCEL_EXAM: "Cancel Exam",
  CANCEL_EXAM_CONFIRM: "Cancel this exam? Students will not be able to access it.",
  STUDENTS_SECTION: "Students",
  ADD_EXISTING_STUDENTS: "Add existing students",
  ADD_STUDENTS_CANCEL: "Cancel",
  ADD_STUDENTS_SUBMIT: "Add to exam",
  ADD_STUDENTS_SUBMITTING: "Adding...",
  AUDIENCE_LOCKED_NOTICE:
    "Students can't be added or removed while this exam is being prepared or running. You can edit the list when it is Scheduled or Closed.",
  PROCTORS_SECTION: "Proctors",
  ANSWERS_SECTION: "Submitted Answers",
  EXAMINER_ASSIGNMENTS_SECTION: "Examiner assignments",
  CONFIGURATION_SECTION: "Exam configuration",
  MODE_LABEL: "Mode",
  SKILLS_LABEL: "Skills included",
  RETRIES_LABEL: "Retries per student",
  SECURITY_POLICY_LABEL: "Security policy",
  LEGACY_MODE: "Previously created exam",
  LEGACY_SKILLS: "Template-defined skills",
  TOTAL_ATTEMPTS: (retries: number) =>
    `${retries} ${retries === 1 ? "retry" : "retries"} allowed (${retries + 1} total ${retries === 0 ? "attempt" : "attempts"})`,
  RETRIES_SUMMARY: (retries: number) => `${retries} ${retries === 1 ? "retry" : "retries"}`,
  LEGACY_POLICY: CREATE_EXAM_WIZARD_TEXT.POLICY_LEGACY,
  POLICY_UNAVAILABLE: CREATE_EXAM_WIZARD_TEXT.POLICY_UNAVAILABLE,
} as const;

export const EXAM_EDITOR_TEXT = {
  INFORMATION_TITLE: "Exam information",
  INFORMATION_DESCRIPTION: "Identity, schedule, configuration, and access policy for this exam.",
  ACTIONS: "Exam actions",
  EDIT: "Edit",
  SAVE: "Save information",
  CANCEL: "Cancel",
  SAVED: "Exam information saved.",
  SAVE_FAILED: "Unable to save exam information. Please try again.",
  NAME: "Exam name",
  STATUS: "Status",
  CODE: "Exam code",
  MODE: "Mode",
  OPENS_AT: "Opens at",
  CLOSES_AT: "Closes at",
  SKILLS: "Skills included",
  RETRIES: "Retries per student",
  CAPACITY: "Capacity",
  SECURITY_POLICY: "Security policy",
  SUBSCRIPTION: "Subscription",
  REUSE_POLICY: "Student reuse rule",
  SERIES: "Exam series",
  REPLAY_POLICY: "Replay policy",
  REPLAY_UNLIMITED: "Unlimited",
  REPLAY_LIMITED: "Limited",
  REPLAY_LIMIT: "Replay limit",
  DEVICE_CHECK: "Require device check",
  PROCTOR_REQUIRED: "Require proctor",
  ANSWER_INTEGRITY: "Answer integrity",
  ANSWER_STANDARD: "Standard",
  ANSWER_STRICT: "Strict",
  LOCKDOWN: "Lockdown mode",
  LOCKDOWN_STRICT: "Strict",
  READ_ONLY_HELP: "This exam is read-only in its current status.",
  READY_STATUS_HELP: "This generated exam can be scheduled or cancelled from the status field.",
  NAME_REQUIRED: "Enter an exam name.",
  OPEN_REQUIRED: "Choose when the exam opens.",
  CLOSE_REQUIRED: "Choose when the exam closes.",
  CLOSE_AFTER_OPEN: "The close time must be after the open time.",
  CAPACITY_INVALID: "Enter a positive whole-number capacity.",
  RETRIES_INVALID: "Enter a whole number of retries from 0 to 9.",
  SKILLS_REQUIRED: "Select at least one skill.",
  REPLAY_LIMIT_REQUIRED: "Enter a positive replay limit.",
  TEMPLATE_NOT_ACTIVE:
    "The selected exam template is not active. Choose an active template and try again.",
  LOCKDOWN_MODE_INVALID: "The selected security policy is not compatible with this exam mode.",
  LOCKDOWN_MODE_REQUIRED:
    "The exam security policy could not be resolved. Refresh the exam and try again.",
  CLOSE_TIME_NOT_EXTENDED: "The exam has started. Choose a later close time.",
  START_SOON_TITLE: "The exam is about to start",
  START_SOON_DESCRIPTION: "The exam starts within 10 minutes. Do you want to continue editing it?",
  START_SOON_CONFIRM: "Continue editing",
  START_SOON_CANCEL: "Go back",
  START_SOON_TOAST: "The exam starts within 10 minutes. Review the schedule before saving.",
  CLOSE_TIME_REMINDER_TITLE: "Review the close time",
  CLOSE_TIME_REMINDER_DESCRIPTION:
    "The exam has started. You have not changed the close time. If you need more time, extend it before saving.",
  CLOSE_TIME_REMINDER_CONFIRM: "Save current changes",
  CLOSE_TIME_REMINDER_CANCEL: "Review changes",
  CLOSE_TIME_EXTENSION_TITLE: "Confirm close time extension",
  CLOSE_TIME_EXTENSION_DESCRIPTION:
    "The close time will move from {previous} to {next}. Do you want to continue saving this extension?",
  CLOSE_TIME_EXTENSION_CONFIRM: "Extend and save",
  CLOSE_TIME_SHORTENED_TITLE: "Cannot shorten the exam",
  CLOSE_TIME_SHORTENED_DESCRIPTION:
    "This exam has started, so its close time cannot move from {previous} to {next}. Choose a close time later than {previous}.",
  CLOSE_TIME_NOT_IN_FUTURE_TITLE: "Invalid close time",
  CLOSE_TIME_NOT_IN_FUTURE_DESCRIPTION:
    "The new close time must be after the current time. Choose a later time if the exam needs more time.",
} as const;

export const EXAMINER_ASSIGNMENT_TEXT = {
  SCOPE_TYPE_STUDENT: "Student",
  REQUIRES_CLOSED: "Examiners can only be assigned after the exam has closed.",
  LOCKED_NOTICE:
    "The assignment is committed. You can still change the Examiner of an attempt that has not been finalized.",
  HINT: "Select Examiners and click “Randomize” to pre-fill the table, then adjust any student's Examiner. Click “Commit assignment” once every student has an Examiner.",
  EXAMINERS_LABEL: "Examiners",
  EXAMINER_LABEL: "Examiner",
  EXAMINER_PLACEHOLDER: "Select an Examiner",
  NO_EXAMINERS: "No active Examiners are available in this organization.",
  LOADING: "Loading...",
  RANDOMIZE: "Randomize",
  PROGRESS: "{assigned}/{total} students have an Examiner",
  COMMIT: "Commit assignment",
  COMMITTING: "Committing...",
  CANCEL: "Cancel",
  COMMIT_TITLE: "Commit the grading assignment?",
  COMMIT_DESCRIPTION: "Once committed, the assignment table is locked and cannot be edited.",
  CONFIRMED: "Assignment committed.",
  EMPTY: "No submitted attempts to assign yet.",
  UNKNOWN_STUDENT: "Unknown student",
  RETRY: "Retry",
  PROGRESS_COLUMN: "Grading",
  STATUS_NOT_STARTED: "Not started",
  STATUS_IN_PROGRESS: "In progress",
  STATUS_COMPLETED: "Finalized",
  DRAFT_COUNT: "{count} drafts",
  CHANGE_EXAMINER: "Change Examiner",
  REASSIGN_TITLE: "Change the Examiner?",
  REASSIGN_DESCRIPTION:
    "The new Examiner takes over this attempt. Drafts already saved ({count}) are kept and flagged for the new Examiner to confirm; open issue reports are closed automatically. The previous Examiner loses access immediately.",
  REASSIGN_CONFIRM: "Change Examiner",
  REASSIGN_PENDING: "Changing...",
  REASSIGN_DONE: "Examiner changed.",
  NEW_EXAMINER: "New Examiner",
} as const;

export const EXAM_PREVIEW_TEXT = {
  TITLE: "Exam Preview",
  ANSWER_KEY_NOTICE: "Correct answers and scoring keys are hidden in this preview.",
  ITEM_COUNT: (count: number) => `${count} question${count === 1 ? "" : "s"}`,
  OPTIONS: "Options",
  AUDIO: "Audio prompt",
  WORD_COUNT: (min: number | null, max: number | null) => {
    if (min !== null && max !== null) return `${min}–${max} words`;
    if (min !== null) return `At least ${min} words`;
    if (max !== null) return `Up to ${max} words`;
    return "";
  },
  UNAVAILABLE: "The published exam questions are not available yet.",
} as const;

export const PROCTOR_SECTION_TEXT = {
  ASSIGN_PROCTOR: "Assign Proctor",
  EMPTY_TITLE: "No proctors assigned yet",
  UNASSIGN: "Remove from Exam",
} as const;

export const PROCTOR_TABLE_HEADERS = {
  FULL_NAME: "Full name",
  EMAIL: "Email",
  ROLE: "Role",
  ACTIONS: "Actions",
} as const;

export const DEFAULT_PROCTOR_ROLE: ProctorRole = "ASSISTANT_PROCTOR";

export const PROCTOR_ROLE_LABELS: Record<ProctorRole, string> = {
  LEAD_PROCTOR: "Lead Proctor",
  ASSISTANT_PROCTOR: "Assistant Proctor",
};

/** Shown to the Host so they know what each role means before assigning/changing it. */
export const PROCTOR_ROLE_DESCRIPTIONS: Record<ProctorRole, string> = {
  LEAD_PROCTOR:
    "Primary point of contact for this exam session. Coordinates the other proctors and is responsible for resolving incidents.",
  ASSISTANT_PROCTOR:
    "Supports session monitoring — watches over students and reports incidents to the Lead Proctor.",
};

export const PROCTOR_ROLE_OPTIONS: { value: ProctorRole; label: string }[] = [
  { value: "ASSISTANT_PROCTOR", label: PROCTOR_ROLE_LABELS.ASSISTANT_PROCTOR },
  { value: "LEAD_PROCTOR", label: PROCTOR_ROLE_LABELS.LEAD_PROCTOR },
];

export const ASSIGN_PROCTOR_TEXT = {
  TITLE: "Assign Proctor to Exam",
  EXISTING_LABEL: "Proctor",
  EXISTING_PLACEHOLDER: "Select a proctor",
  NO_EXISTING: "No unassigned proctors are available in your organization.",
  ROLE_LABEL: "Role in this exam",
  CANCEL: "Cancel",
  SUBMIT: "Assign to Exam",
  SUBMITTING: "Assigning...",
} as const;
