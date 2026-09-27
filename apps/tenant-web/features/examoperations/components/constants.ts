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
  EMPTY_VALUE: "—",
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
  UNABLE_TO_LOAD_FALLBACK: "Please try again.",
  EMPTY_TITLE: "No learners yet",
  EMPTY_TEXT: "Students created via roster import or added individually will appear here.",
  EMPTY_VALUE: "—",
  TOTAL_ITEMS: (count: number) => `Showing ${count} student(s)`,
} as const;

export const STUDENT_TABLE_HEADERS = {
  FULL_NAME: "Full name",
  EMAIL: "Email",
  STUDENT_CODE: "Student code",
  CLASS_NAME: "Class",
  PHONE: "Phone",
} as const;

export const STUDENT_ROW_ACTIONS_TEXT = {
  RESET_PASSWORD: "Reset Password",
  REMOVE_FROM_EXAM: "Remove from Exam",
} as const;

export const STUDENT_ROSTER_TABLE_TEXT = {
  EMPTY_TITLE: "No students enrolled yet",
  EMPTY_VALUE: "—",
} as const;

export const EXISTING_STUDENT_ASSIGNMENT_TEXT = {
  TITLE: "Add Existing Students",
  SEARCH_LABEL: "Search students",
  SEARCH_PLACEHOLDER: "Search by name, email, account, or student code",
  SEARCH_HELPER: "Only active students who are not already enrolled are available.",
  SELECT_ALL: "Select all shown",
  SELECTED: (count: number) => `${count} selected`,
  NO_MATCHES: "No available students match your search.",
  NO_STUDENTS: "No active students are available to add.",
  LOAD_ERROR: "Unable to load students. Please try again.",
  CANCEL: "Cancel",
  SUBMIT: "Add to Exam",
  SUBMITTING: "Adding...",
  TOTAL_ITEMS: (count: number) => `${count} student(s) found`,
} as const;

export const EXISTING_STUDENT_IMPORT_TEXT = {
  TITLE: "Import existing students",
  HELPER:
    "Upload an .xlsx file containing Email, Account, or Student Code. Matching active accounts will be enrolled; no account is created.",
  REVIEW: "Review file",
  REVIEWING: "Reading file...",
  FILE_REQUIRED: "Choose an .xlsx file first.",
  ROWS_FOUND: (count: number) => `${count} row(s) found`,
  MATCHED: (count: number) => `${count} existing student(s) ready to add`,
  SKIPPED: (count: number) => `${count} row(s) will be skipped`,
  SKIPPED_TITLE: "Skipped rows",
  SKIPPED_REASON: "No active existing account matched Email, Account, or Student Code.",
  ALREADY_ENROLLED: "This student is already enrolled in the exam.",
  IDENTIFIER_REQUIRED: "Add an email, account, or student code to identify the account.",
  NO_MATCHES: "No active existing students matched this file.",
  CANCEL: "Cancel",
  SUBMIT: "Add matched students",
  SUBMITTING: "Adding...",
  LOAD_ERROR: "Unable to load existing students. Please try again.",
  IMPORT_ERROR: "Unable to read this file. Please check the .xlsx format and try again.",
} as const;

export const SKIPPED_ROWS_REPORT_TEXT = {
  HEADING: "{count} row(s) skipped",
  ROW_HEADER: "Row",
  EMAIL_HEADER: "Email",
  REASON_HEADER: "Reason",
} as const;

export const SKIPPED_ROW_REASON_MESSAGES: Record<string, string> = {
  EMAIL_ALREADY_USED: "An account with this email already exists.",
  ROSTER_IMPORT_FAILED:
    "We could not create an account for this row. Please review it and try again.",
};

export const SKIPPED_ROW_UNKNOWN_REASON =
  "This row could not be imported. Please review it and try again.";

export const ROSTER_REVIEW_TABLE_HEADERS = {
  EMAIL: "Email",
  FULL_NAME: "Full Name",
  CLASS_NAME: "Class",
} as const;

export const RESET_STUDENT_PASSWORD_TEXT = {
  TITLE: "Reset Password",
  CANCEL: "Cancel",
  SUBMIT: "Reset Password",
  SUBMITTING: "Resetting...",
  NEW_PASSWORD_LABEL: "New password",
  MIN_LENGTH_ERROR: "Password must be at least {minLength} characters.",
} as const;
