import type { ExamMode, FormMode, ProctorRole, ReusePolicy } from "@pte/api-client";
import type { CreateSessionInput, ExamSkill } from "../types";

// react-query cache-key roots — named constants per this repo's established
// convention (avoids raw-string query-key drift/collisions).
export const SESSIONS_QUERY_KEY = ["sessions"] as const;
export const SESSION_QUERY_KEY = ["session"] as const;
export const ENROLLMENTS_QUERY_KEY = ["enrollments"] as const;
export const PROCTOR_ASSIGNMENTS_QUERY_KEY = ["proctorAssignments"] as const;
export const TENANT_USERS_QUERY_KEY = ["tenantUsers"] as const;
export const ANSWERS_QUERY_KEY = ["answers"] as const;
export const ANSWER_QUERY_KEY = ["answer"] as const;
export const EXAM_PREVIEW_QUERY_KEY = ["examPreview"] as const;
export const ASSIGNED_CLASSES_QUERY_KEY = ["assignedClasses"] as const;
export const EXAMINER_ASSIGNMENT_OVERVIEW_QUERY_KEY = ["examinerAssignmentOverview"] as const;
export const EXAMINER_DIRECTORY_QUERY_KEY = ["examinerAssignmentDirectory"] as const;

export const EXAMS_TEXT = {
  TITLE: "Exams",
  SUBTITLE: "Manage exam sessions, rosters, and proctors.",
  ADD_EXAM: "Create Exam",
  EMPTY_TITLE: "No exams yet",
  EMPTY_TEXT: "Create your first exam session to start adding students.",
} as const;

export const EXAM_TABLE_HEADERS = {
  NAME: "Exam Name",
  STATUS: "Status",
  OPENS_AT: "Opens",
  CLOSES_AT: "Closes",
} as const;

export const SESSION_STATUS_LABELS = {
  DRAFT: "Draft",
  PREPARING: "Preparing",
  READY: "Ready to publish",
  SCHEDULED: "Scheduled",
  OPEN: "Open",
  CLOSED: "Closed",
  CANCELLED: "Cancelled",
} as const;

export const SESSION_STATUS_VARIANT = {
  DRAFT: "neutral",
  PREPARING: "info",
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
  SUBSCRIPTION_HELPER: "The exam's window and capacity must fit within this subscription.",
  PLAN_FALLBACK: "Plan",
  SUBSCRIPTION_OPTION: (planName: string, licenseKey: string) => `${planName} — ${licenseKey}`,
  NO_ACTIVE_SUBSCRIPTIONS:
    "No active subscription yet — redeem a license or purchase a plan first.",
  SKILLS_LABEL: "Skills",
  SKILLS_HELPER:
    "The system randomly generates the exam from the question bank for the skills you pick (1 to 4).",
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
  STEP_BASIC: "1. Exam details",
  STEP_AUDIENCE: "2. Audience and generation",
  NAME_LABEL: "Exam name",
  NAME_PLACEHOLDER: "e.g. Semester 1 mock exam",
  TEMPLATE_LABEL: "Exam template",
  TEMPLATE_PLACEHOLDER: "Select an active template",
  PLAN_FALLBACK: "Plan",
  TEMPLATE_HELPER:
    "The active platform template determines the exam structure and question requirements.",
  SUBSCRIPTION_LABEL: "Subscription",
  SUBSCRIPTION_PLACEHOLDER: "Select an active subscription",
  OPENS_AT_LABEL: "Opens at",
  CLOSES_AT_LABEL: "Closes at",
  CAPACITY_LABEL: "Maximum students",
  MODE_LABEL: "Exam mode",
  FORM_MODE_LABEL: "Question form",
  REUSE_POLICY_LABEL: "Student reuse rule",
  SERIES_LABEL: "Exam series",
  SERIES_PLACEHOLDER: "e.g. 2026-HK1",
  SOURCES_TITLE: "Audience sources",
  SOURCES_HELPER:
    "Select existing students, classes, or programs. Duplicate students are automatically removed.",
  SOURCE_TYPE_LABEL: "Source type",
  SOURCE_OPTION_LABEL: "Existing source",
  SOURCE_SEARCH_LABEL: "Search existing sources",
  SOURCE_SEARCH_PLACEHOLDER: "Search by name, email, account, or code",
  SOURCE_PLACEHOLDER: "Select an existing source",
  SOURCE_LOADING: "Loading existing sources...",
  SOURCE_EMPTY: "No existing sources match your search.",
  SOURCE_HELPER: "Only existing records from this organization can be selected.",
  MANAGE_CLASSES: "Manage classes",
  ADD_SOURCE: "Add source",
  REMOVE_SOURCE: "Remove",
  NO_SOURCES: "Add at least one student, class, or program source.",
  NO_TEMPLATE:
    "No active exam template is available yet. Ask the platform administrator to activate one.",
  NO_ACTIVE_SUBSCRIPTIONS: "No active subscription is available for this exam.",
  REVIEW_TITLE: "Review before generation",
  REVIEW_TEMPLATE: "Template",
  REVIEW_AUDIENCE: "Audience sources",
  REVIEW_RULE: "Student reuse rule",
  REVIEW_CAPACITY: "Maximum students",
  EMPTY_VALUE: "—",
  TEMPLATE_READY: "The template has enough published questions.",
  TEMPLATE_NOT_READY: "The question bank does not yet have enough questions for this template.",
  BACK: "Back",
  NEXT: "Review audience",
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
  MODE_PRACTICE: "Practice",
  MODE_MOCK: "Mock exam",
  MODE_REAL: "Official exam",
  FORM_SHARED: "One shared form",
  FORM_UNIQUE: "Separate form per student",
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
  SERIES_REQUIRED: "Add an exam series for this reuse rule.",
  SOURCE_REQUIRED: "Select an existing source before adding it.",
  SOURCE_DUPLICATE: "This audience source has already been added.",
  AUDIENCE_REQUIRED: "Add at least one audience source.",
  OPEN_FUTURE: "Choose an opening time in the future.",
} as const;

export const EXAM_MODE_OPTIONS: { value: ExamMode; label: string }[] = [
  { value: "PRACTICE", label: CREATE_EXAM_WIZARD_TEXT.MODE_PRACTICE },
  { value: "MOCK_TEST", label: CREATE_EXAM_WIZARD_TEXT.MODE_MOCK },
  { value: "REAL_EXAM", label: CREATE_EXAM_WIZARD_TEXT.MODE_REAL },
];

export const FORM_MODE_OPTIONS: { value: FormMode; label: string }[] = [
  { value: "SHARED_FORM", label: CREATE_EXAM_WIZARD_TEXT.FORM_SHARED },
  { value: "UNIQUE_FORM_PER_STUDENT", label: CREATE_EXAM_WIZARD_TEXT.FORM_UNIQUE },
];

export const REUSE_POLICY_OPTIONS: { value: ReusePolicy; label: string }[] = [
  { value: "ALLOW", label: CREATE_EXAM_WIZARD_TEXT.REUSE_ALLOW },
  { value: "EXCLUDE_STARTED_IN_SERIES", label: CREATE_EXAM_WIZARD_TEXT.REUSE_STARTED },
  { value: "EXCLUDE_ASSIGNED_IN_SERIES", label: CREATE_EXAM_WIZARD_TEXT.REUSE_ASSIGNED },
  { value: "BLOCK_ON_SCHEDULE_OVERLAP", label: CREATE_EXAM_WIZARD_TEXT.REUSE_OVERLAP },
];

export const AUDIENCE_SOURCE_OPTIONS = [
  { value: "STUDENT", label: "Student" },
  { value: "CLASS", label: "Class" },
  { value: "PROGRAM", label: "Program" },
] as const;

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
  VIEW_EXAM: "View Exam",
  OPEN_EXAM: "Open Exam",
  CLOSE_EXAM: "Close Exam",
  CANCEL_EXAM: "Cancel Exam",
  CANCEL_EXAM_CONFIRM: "Cancel this exam? Students will not be able to access it.",
  STUDENTS_SECTION: "Students",
  ADD_EXISTING_STUDENTS: "Add existing students",
  IMPORT_EXISTING_STUDENTS: "Import existing students",
  AUDIENCE_NOT_SCHEDULED_NOTICE:
    "Students can only be added while this exam is Scheduled. The buttons are enabled then.",
  CLASSES_SECTION: "Assigned Classes",
  PROCTORS_SECTION: "Proctors",
  ANSWERS_SECTION: "Submitted Answers",
  EXAMINER_ASSIGNMENTS_SECTION: "Examiner assignments",
} as const;

export const EXAMINER_ASSIGNMENT_TEXT = {
  MODE_LABEL: "Assignment method",
  RANDOM_MODE: "Random pooled (balanced)",
  MANUAL_MODE: "Assign by Class/Program",
  SCOPE_LABEL: "Class or Program",
  SCOPE_TYPE_CLASS: "Class",
  SCOPE_TYPE_PROGRAM: "Program",
  SCOPE_PLACEHOLDER: "Select a scope",
  ADD_SCOPE: "Add scope",
  REMOVE_SCOPE: "Remove",
  EXAMINERS_LABEL: "Examiners",
  EXAMINER_LABEL: "Examiner",
  EXAMINER_PLACEHOLDER: "Select an active Examiner",
  NO_EXAMINERS: "No active Examiners are available in this organization.",
  NO_ACTIVE_SCOPES: "No active Classes are available for assignment.",
  NO_SCOPES: "Assign at least one Class or Program scope.",
  RANDOM_HELP:
    "All selected scopes are combined into one pool, then attempts are split as evenly as possible.",
  SUPPLEMENTAL_HELP:
    "Already assigned attempts are excluded; this preview adds only new eligible attempts.",
  PREVIEW: "Preview assignment",
  PREVIEWING: "Preparing preview...",
  PREVIEW_VALID: "Preview ready. Confirm to commit this exact allocation.",
  PREVIEW_INVALID: "No valid allocation was created. Review the conflicts or selected scope.",
  CONFLICTS: "Manual mapping conflicts",
  ATTEMPT: "Attempt",
  CONFLICTING_SCOPES: "Conflicting scopes",
  ATTEMPT_COUNT: "Attempts",
  ANSWER_COUNT: "Eligible answers",
  LOADS: "Distribution by Examiner",
  CONFIRM: "Confirm assignment",
  CONFIRMING: "Confirming...",
  CONFIRMED: "Assignment committed.",
  EXPIRED: "This preview expired. Create a new preview.",
  STALE:
    "This preview is no longer valid because the candidate pool changed. Create a new preview.",
  RETRY: "Retry",
  BATCHES: "Preview and assignment history",
  NO_BATCHES: "No assignment batches yet.",
  ASSIGNED_TOTAL: (count: number) => `${count} attempt(s) assigned in this session`,
  CREATED: "Created",
  STATUS: "Status",
  ACTIONS: "Actions",
  PREVIOUS_PAGE: "Previous",
  NEXT_PAGE: "Next",
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

export const CLASS_ASSIGNMENT_TEXT = {
  EMPTY_TITLE: "No Classes assigned yet",
  ASSIGN_LABEL: "Class",
  ASSIGN_PLACEHOLDER: "Select a Class to assign",
  ASSIGN: "Assign Class",
  ASSIGNING: "Assigning...",
  SOURCE_LOCKED: "Class assignment is available only while this exam is Scheduled.",
  UNASSIGN: "Unassign",
  ACTIONS: "Actions",
  NOT_SCHEDULED_NOTICE: "Classes can only be assigned or unassigned while this exam is Scheduled.",
} as const;

export const ANSWERS_SECTION_TEXT = {
  EMPTY_TITLE: "No answers submitted yet",
  STATUS_FILTER_LABEL: "Status",
  STATUS_FILTER_ALL: "All statuses",
  VIEW: "View",
} as const;

export const ANSWER_TABLE_HEADERS = {
  TASK_TYPE: "Task Type",
  STATUS: "Status",
  AI_SCORE: "AI Score",
  TEACHER_SCORE: "Teacher Score",
  SUBMITTED_AT: "Submitted",
  ACTIONS: "Action",
} as const;

export const ANSWER_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  AI_SCORING: "AI Scoring",
  SCORING_FAILED: "Scoring Failed",
  SCORED: "Scored",
};

export const ANSWER_STATUS_VARIANT: Record<string, "info" | "success" | "neutral" | "danger"> = {
  PENDING: "neutral",
  AI_SCORING: "info",
  SCORING_FAILED: "danger",
  SCORED: "success",
};

export const ANSWER_DETAIL_TEXT = {
  TITLE: "Submitted Answer",
  TASK_TYPE_LABEL: "Task type",
  STATUS_LABEL: "Status",
  AI_SCORE_LABEL: "AI score",
  NOT_SCORED: "Not scored yet",
  OPTIONS_TITLE: "Options",
  SELECTED_BADGE: "Selected",
  CORRECT_BADGE: "Correct",
  AUDIO_UNAVAILABLE: "Audio recording is not available right now.",
  UNRECOGNIZED_NOTICE:
    "This answer's format could not be decoded automatically. Showing the raw submitted value below.",
  TEACHER_SCORE_TITLE: "Teacher Score",
  TEACHER_SCORE_HELPER:
    "Recorded independently of the AI score, 0-100. Does not affect the official result.",
  TEACHER_SCORE_LABEL: "Score (0-100)",
  SUBMIT: "Save Score",
  SUBMITTING: "Saving...",
  SAVED: "Score saved.",
  CLOSE: "Close",
} as const;

export const PROCTOR_SECTION_TEXT = {
  ASSIGN_PROCTOR: "Assign Proctor",
  EMPTY_TITLE: "No proctors assigned yet",
  UNASSIGN: "Remove from Exam",
  ASSIGNED_COUNT: "{count} proctor(s) assigned",
} as const;

export const PROCTOR_TABLE_HEADERS = {
  FULL_NAME: "Full name",
  EMAIL: "Email",
  ROLE: "Role",
  ACTIONS: "Action",
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
