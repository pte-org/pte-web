import type { ProctorRole } from "@pte/api-client";

// react-query cache-key roots — named constants per this repo's established
// convention (avoids raw-string query-key drift/collisions).
export const SESSIONS_QUERY_KEY = ["sessions"] as const;
export const SESSION_QUERY_KEY = ["session"] as const;
export const BLUEPRINTS_QUERY_KEY = ["blueprints"] as const;
export const ENROLLMENTS_QUERY_KEY = ["enrollments"] as const;
export const PROCTOR_ASSIGNMENTS_QUERY_KEY = ["proctorAssignments"] as const;
export const TENANT_USERS_QUERY_KEY = ["tenantUsers"] as const;
export const ANSWERS_QUERY_KEY = ["answers"] as const;
export const ANSWER_QUERY_KEY = ["answer"] as const;

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
  SCHEDULED: "Scheduled",
  OPEN: "Open",
  CLOSED: "Closed",
} as const;

export const SESSION_STATUS_VARIANT = {
  SCHEDULED: "info",
  OPEN: "success",
  CLOSED: "neutral",
} as const;

export const CREATE_SESSION_TEXT = {
  TITLE: "Create Exam",
  SECTION_CONTENT: "Exam Content",
  NAME_LABEL: "Exam name",
  NAME_PLACEHOLDER: "e.g. Mid-term PTE Mock Test",
  BLUEPRINT_LABEL: "Question set",
  BLUEPRINT_PLACEHOLDER: "Select a question set",
  OPENS_AT_LABEL: "Opens at",
  CLOSES_AT_LABEL: "Closes at",
  CANCEL: "Cancel",
  SUBMIT: "Create Exam",
  SUBMITTING: "Creating...",
  NO_BLUEPRINTS: "No question sets available — create one in the question bank first.",
} as const;

export const CREATE_SESSION_ERRORS = {
  NAME_REQUIRED: "Exam name is required.",
  BLUEPRINT_REQUIRED: "Select a question set.",
  OPENS_AT_REQUIRED: "Opens-at date/time is required.",
  OPENS_AT_FUTURE: "Opens-at must be in the future.",
  CLOSES_AT_REQUIRED: "Closes-at date/time is required.",
  CLOSES_AT_AFTER_OPENS: "Closes-at must be after opens-at.",
} as const;

export const EMPTY_CREATE_SESSION = {
  name: "",
  blueprintPublicId: "",
  opensAt: "",
  closesAt: "",
} as const;

export const SESSION_DETAIL_TEXT = {
  BACK: "Back to Exams",
  OPEN_EXAM: "Open Exam",
  CLOSE_EXAM: "Close Exam",
  STUDENTS_SECTION: "Students",
  PROCTORS_SECTION: "Proctors",
  ANSWERS_SECTION: "Submitted Answers",
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
  TEACHER_SCORE_HELPER: "Recorded independently of the AI score, 0-100. Does not affect the official result.",
  TEACHER_SCORE_LABEL: "Score (0-100)",
  SUBMIT: "Save Score",
  SUBMITTING: "Saving...",
  SAVED: "Score saved.",
  CLOSE: "Close",
} as const;

export const PROCTOR_SECTION_TEXT = {
  ADD_PROCTOR: "Add Proctor",
  EMPTY_TITLE: "No proctors assigned yet",
  UNASSIGN: "Remove from Exam",
  ASSIGNED_COUNT: "{count} proctor(s) assigned",
  ROLES_LEGEND_TITLE: "About proctor roles",
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
  TITLE: "Add Proctor to Exam",
  TAB_EXISTING: "Pick Existing",
  TAB_NEW: "Create New",
  EXISTING_LABEL: "Proctor",
  EXISTING_PLACEHOLDER: "Select a proctor",
  NO_EXISTING: "No existing proctors in your organization yet — create one below.",
  EMAIL_LABEL: "Email",
  EMAIL_PLACEHOLDER: "proctor@school.edu.vn",
  FULL_NAME_LABEL: "Full name",
  PASSWORD_LABEL: "Password",
  PASSWORD_HELPER: "At least 8 characters. Share this with the proctor directly.",
  ROLE_LABEL: "Role in this exam",
  CANCEL: "Cancel",
  SUBMIT: "Add to Exam",
  SUBMITTING: "Adding...",
} as const;

export const CREATE_PROCTOR_ERRORS = {
  EMAIL_REQUIRED: "Email is required.",
  EMAIL_INVALID: "Enter a valid email address.",
  FULL_NAME_REQUIRED: "Full name is required.",
  PASSWORD_TOO_SHORT: "Password must be at least 8 characters.",
} as const;

export const EMPTY_CREATE_PROCTOR = { email: "", fullName: "", password: "" } as const;
