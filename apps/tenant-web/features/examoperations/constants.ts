import type { RosterField, RosterTemplateColumn } from "./types";

export const BYTES_PER_MEGABYTE = 1024 * 1024;

/** A roster of a few thousand rows fits well under this. */
export const ROSTER_MAX_FILE_SIZE_BYTES = 5 * BYTES_PER_MEGABYTE;

/** Excel turns a typed 0901234567 into the number 901234567, so these columns are pre-formatted as Text. */
const TEXT_COLUMN_FORMAT = "Text (pre-formatted as Text so leading zeros are kept)";

/**
 * Marks the template's sample row (row 2). The parser skips a row whose Email cell holds exactly this value,
 * so a template uploaded untouched never creates an account.
 */
export const ROSTER_SAMPLE_ROW_MARKER = "sample.student@example.com (sample row, ignored on import)";

/**
 * Single source of truth for the downloadable template and for the strict header check: a create-flow file must
 * use exactly these headers. `username` is intentionally absent — the system creates it.
 */
export const ROSTER_TEMPLATE_COLUMNS: readonly RosterTemplateColumn[] = [
  {
    field: "email",
    header: "Email",
    required: true,
    forceText: false,
    format: "A valid email address; receives the scores and the account details",
    example: "a.nguyen@example.com",
    sample: ROSTER_SAMPLE_ROW_MARKER,
  },
  {
    field: "fullName",
    header: "Full Name",
    required: true,
    forceText: false,
    format: "Text, at most 100 characters",
    example: "Nguyen Van A",
    sample: "Nguyen Van A",
  },
  {
    field: "studentCode",
    header: "Student Code",
    required: false,
    forceText: true,
    format: `${TEXT_COLUMN_FORMAT}, at most 50 characters`,
    example: "SE123456",
    sample: "SE123456",
  },
  {
    field: "programName",
    header: "Program Name",
    required: false,
    forceText: false,
    format: "Text, for your reference; leave blank if the student is not in a program yet",
    example: "PTE Academic",
    sample: "Leave blank if the student is not in a program yet",
  },
  {
    field: "className",
    header: "Class Name",
    required: false,
    forceText: false,
    format: "Text, for your reference; leave blank if the student is not in a class yet",
    example: "PTE-Morning-01",
    sample: "Leave blank if the student is not in a class yet",
  },
  {
    field: "phone",
    header: "Phone",
    required: false,
    forceText: true,
    format: `${TEXT_COLUMN_FORMAT}; 9 to 15 digits, + allowed at the start`,
    example: "0901234567",
    sample: "0901234567",
  },
  {
    field: "dateOfBirth",
    header: "Date of Birth",
    required: false,
    forceText: false,
    format: "yyyy-mm-dd, or an Excel date cell; must be in the past",
    example: "2008-01-15",
    sample: "2008-01-15",
  },
];

/** Limits shared with the backend roster rules (`RosterRowValidator`). */
export const ROSTER_FIELD_LIMITS = {
  EMAIL_MAX_LENGTH: 254,
  FULL_NAME_MAX_LENGTH: 100,
  STUDENT_CODE_MAX_LENGTH: 50,
  CLASS_NAME_MAX_LENGTH: 100,
  PROGRAM_NAME_MAX_LENGTH: 100,
} as const;

export const ROSTER_EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
export const ROSTER_PHONE_PATTERN = /^\+?\d{9,15}$/;
export const ROSTER_PHONE_SEPARATORS = /[\s.-]/g;
export const ROSTER_ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export const ROSTER_FIELD_LABELS: Record<RosterField, string> = {
  email: "Email",
  username: "Username",
  fullName: "Full Name",
  studentCode: "Student Code",
  programName: "Program Name",
  className: "Class Name",
  phone: "Phone",
  dateOfBirth: "Date of Birth",
};

/** Row messages, keyed by the backend roster codes so client and server problems read the same. */
export const ROSTER_ROW_MESSAGES: Record<string, string> = {
  EMAIL_REQUIRED: "Email is required.",
  EMAIL_INVALID: "Email is not a valid address.",
  EMAIL_TOO_LONG: "Email is longer than 254 characters.",
  DUPLICATE_EMAIL_IN_BATCH: "This email appears more than once in the file.",
  FULL_NAME_REQUIRED: "Full Name is required.",
  FULL_NAME_TOO_LONG: "Full Name is longer than 100 characters.",
  STUDENT_CODE_TOO_LONG: "Student Code is longer than 50 characters.",
  PROGRAM_NAME_TOO_LONG: "Program Name is longer than 100 characters.",
  CLASS_NAME_TOO_LONG: "Class Name is longer than 100 characters.",
  PHONE_INVALID: "Phone must have 9 to 15 digits (a leading + is allowed).",
  DATE_OF_BIRTH_INVALID: "Date of Birth must be a past date written as yyyy-mm-dd.",
};

export const ROSTER_ROW_UNKNOWN_MESSAGE = "This value is not valid.";

export const ROSTER_ROW_ISSUES_TEXT = {
  TITLE: (count: number) =>
    `${count} problem${count === 1 ? "" : "s"} must be fixed before any account is created`,
  HINT: "Fix these cells in your Excel file and upload it again. Nothing has been created.",
  ROW: (row: number) => `Row ${row}`,
  SERVER_ROW: (position: number) => `Student #${position}`,
  MORE: (count: number) => `…and ${count} more.`,
} as const;

/** Keeps a long list of problems readable; the Host fixes the file and sees the rest on the next upload. */
export const ROSTER_ROW_ISSUES_MAX_LISTED = 20;

/** Rows of the Students sheet that carry the Text format, i.e. how many students fit before formatting ends. */
export const ROSTER_TEMPLATE_FORMATTED_ROWS = 1000;

export const ROSTER_TEMPLATE_FILE_NAME = "student-import-template.xlsx";

export const ROSTER_TEMPLATE_SHEETS = {
  STUDENTS: "Students",
  INSTRUCTIONS: "Instructions",
} as const;

export const ROSTER_TEMPLATE_TEXT = {
  BUTTON: "Download template",
  HINT: "Fill in the system template: one student per row, starting on row 3 (row 2 is a sample).",
  INSTRUCTIONS_TITLE: "How to fill in the Students sheet",
  COLUMN_HEADER: "Column",
  REQUIRED_HEADER: "Required",
  FORMAT_HEADER: "Format",
  EXAMPLE_HEADER: "Example",
  REQUIRED_YES: "Yes",
  REQUIRED_NO: "No",
  NOTES_TITLE: "Notes",
  NOTES: [
    "Row 2 of the Students sheet is a sample and is always ignored. Enter one student per row from row 3. Do not rename, add or remove columns.",
    "Email and Full Name are required. The system creates the username and a temporary password for each student; the email receives the scores and the account details.",
    "Program Name and Class Name are for your reference. Leave them blank if the student is not in a program or class yet. Importing from a class page adds every new student to that class.",
    "The same email cannot appear twice in one file. A student who already has an account in your organization is skipped.",
    `Upload the file as .xlsx, at most ${ROSTER_MAX_FILE_SIZE_BYTES / BYTES_PER_MEGABYTE} MB.`,
  ],
} as const;

export const ROSTER_TEMPLATE_TEXT_VI = {
  BUTTON: "Tải mẫu",
  HINT: "Điền mẫu hệ thống: dòng 2 là dòng mẫu, mỗi dòng một học viên bắt đầu từ dòng 3.",
} as const;

const MAX_LISTED_COLUMNS = 10;
const COLUMN_LIST_SEPARATOR = ", ";
const COLUMN_LIST_OVERFLOW = "...";

/** Keeps a wide spreadsheet from turning an error message into a wall of text. */
function formatColumnList(columns: readonly string[]): string {
  const listed = columns.slice(0, MAX_LISTED_COLUMNS).join(COLUMN_LIST_SEPARATOR);
  return columns.length > MAX_LISTED_COLUMNS ? `${listed}${COLUMN_LIST_OVERFLOW}` : listed;
}

export const ROSTER_FILE_ERRORS = {
  COLUMNS_MISMATCH: (unknownColumns: readonly string[], missingColumns: readonly string[]) =>
    [
      "This file does not match the system template.",
      missingColumns.length > 0 ? `Missing columns: ${formatColumnList(missingColumns)}.` : "",
      unknownColumns.length > 0 ? `Columns that are not in the template: ${formatColumnList(unknownColumns)}.` : "",
      "Download the template, copy your data into it and upload it again.",
    ]
      .filter(Boolean)
      .join(" "),
  TOO_LARGE: (maxMegabytes: number) => `Import file is too large (max ${maxMegabytes}MB)`,
  NO_DATA_ROWS: "Import file must contain a header row and at least one data row",
  TEMPLATE_REQUIRED: (foundColumns: readonly string[], expectedColumns: readonly string[]) =>
    [
      "This file does not match the system template.",
      foundColumns.length > 0
        ? `Columns found in the first row of your file: ${formatColumnList(foundColumns)}.`
        : "No column headers were found in the first row of your file.",
      `Expected columns: ${formatColumnList(expectedColumns)}.`,
      "Download the template, fill it in and upload it again.",
    ].join(" "),
} as const;

export const ROSTER_COLUMN_WARNING_TEXT = {
  TITLE: "Some columns need your attention",
  IGNORED: (columns: readonly string[]) =>
    `Not part of the system template, so these columns are ignored: ${formatColumnList(columns)}.`,
  MISSING: (columns: readonly string[]) =>
    `Required column not found in your file: ${formatColumnList(columns)}.`,
} as const;

export const ROSTER_SEND_CREDENTIALS_TEXT = {
  LABEL: "E-mail each student their username and temporary password",
  HELPER: "Sent after the accounts are created. You can always download the credentials file as well.",
} as const;
