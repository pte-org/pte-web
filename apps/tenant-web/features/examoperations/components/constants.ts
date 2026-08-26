export const ROSTER_TEXT = {
  HEADING: "Import Learners",
  DROP_PROMPT: "Drag a .xlsx file here or click to choose a file",
  FILE_INPUT_LABEL: "Roster file (.xlsx)",
  CHECK: "Review File",
  REVIEW_ROWS: "Rows found",
  CREATE_ACCOUNTS: "Create Accounts",
  CREATING: "Creating accounts",
  ACCOUNTS_CREATED: "{count} account(s) created.",
  DOWNLOAD: "Download Credentials",
  ENROLL: "Enroll into this Exam",
  ENROLLING: "Enrolling",
  ENROLL_ERROR_TITLE: "Accounts created, but enrollment failed — retry enrolling",
  RECOVERY_TITLE: "Unfinished import found",
  RECOVERY_TEXT:
    "Accounts were created but not yet confirmed enrolled in this exam. Download the credentials if you haven't, then retry enrolling.",
  REDOWNLOAD: "Re-download Credentials",
  RETRY_ENROLL: "Retry Enrolling",
  DISMISS: "Dismiss (I'll enroll these separately)",
  UNKNOWN_ERROR: "An unknown error occurred.",
} as const;

export const ACCEPTED_FILE_TYPE = ".xlsx";

export const ADD_STUDENT_TEXT = {
  TITLE: "Add Student",
  EMAIL_LABEL: "Email",
  FULL_NAME_LABEL: "Full name",
  STUDENT_CODE_LABEL: "Student code",
  CLASS_LABEL: "Class",
  PHONE_LABEL: "Phone",
  DOB_LABEL: "Date of birth",
  SUBMIT: "Add Student",
  SUBMITTING: "Adding...",
  SUCCESS: "Student account created and enrolled.",
} as const;

export const LEARNERS_OVERVIEW_TEXT = {
  TITLE: "Learners",
  SUBTITLE: "All student accounts in your organization.",
  UNABLE_TO_LOAD: "Unable to load learners",
  EMPTY_TITLE: "No learners yet",
  EMPTY_TEXT: "Students created via roster import or added individually will appear here.",
} as const;
