// react-query cache-key roots — named constants per this repo's established
// convention (avoids raw-string query-key drift/collisions).
export const SESSIONS_QUERY_KEY = ["sessions"] as const;
export const SESSION_QUERY_KEY = ["session"] as const;
export const BLUEPRINTS_QUERY_KEY = ["blueprints"] as const;
export const ENROLLMENTS_QUERY_KEY = ["enrollments"] as const;
export const PROCTOR_ASSIGNMENTS_QUERY_KEY = ["proctorAssignments"] as const;
export const TENANT_USERS_QUERY_KEY = ["tenantUsers"] as const;

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
} as const;

export const PROCTOR_SECTION_TEXT = {
  ADD_PROCTOR: "Add Proctor",
  EMPTY_TITLE: "No proctors assigned yet",
  UNASSIGN: "Remove from Exam",
  ASSIGNED_COUNT: "{count} proctor(s) assigned",
} as const;

export const PROCTOR_TABLE_HEADERS = {
  FULL_NAME: "Full name",
  EMAIL: "Email",
} as const;

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
