import type { RosterTemplateColumn } from "./types";

export const BYTES_PER_MEGABYTE = 1024 * 1024;

/** A roster of a few thousand rows fits well under this. */
export const ROSTER_MAX_FILE_SIZE_BYTES = 5 * BYTES_PER_MEGABYTE;

/** Excel turns a typed 0901234567 into the number 901234567, so these columns must be Text. */
const TEXT_COLUMN_FORMAT = "Text (format the column as Text so leading zeros are kept)";

/**
 * Single source of truth for the downloadable template: the header text of each
 * column must resolve (via the parser's header normalisation) back to `field`.
 * `username` is intentionally absent — create flows never send it.
 */
export const ROSTER_TEMPLATE_COLUMNS: readonly RosterTemplateColumn[] = [
  {
    field: "fullName",
    header: "Full Name",
    required: true,
    format: "Text",
    example: "Nguyen Van A",
  },
  {
    field: "email",
    header: "Email",
    required: false,
    format: "A valid email address",
    example: "a.nguyen@example.com",
  },
  {
    field: "studentCode",
    header: "Student Code",
    required: false,
    format: TEXT_COLUMN_FORMAT,
    example: "SE123456",
  },
  {
    field: "className",
    header: "Class Name",
    required: false,
    format: "Text",
    example: "PTE-Morning-01",
  },
  {
    field: "phone",
    header: "Phone",
    required: false,
    format: TEXT_COLUMN_FORMAT,
    example: "0901234567",
  },
  {
    field: "dateOfBirth",
    header: "Date of Birth",
    required: false,
    format: "yyyy-mm-dd, or an Excel date cell",
    example: "2008-01-15",
  },
];

export const ROSTER_TEMPLATE_FILE_NAME = "student-import-template.xlsx";

export const ROSTER_TEMPLATE_SHEETS = {
  STUDENTS: "Students",
  INSTRUCTIONS: "Instructions",
} as const;

export const ROSTER_TEMPLATE_TEXT = {
  BUTTON: "Download template",
  HINT: "Fill in the system template: one student per row, starting on row 2.",
  INSTRUCTIONS_TITLE: "How to fill in the Students sheet",
  COLUMN_HEADER: "Column",
  REQUIRED_HEADER: "Required",
  FORMAT_HEADER: "Format",
  EXAMPLE_HEADER: "Example",
  REQUIRED_YES: "Yes",
  REQUIRED_NO: "No",
  NOTES_TITLE: "Notes",
  NOTES: [
    "Enter one student per row in the Students sheet, starting on row 2. Do not rename the header row.",
    "Keep notes and sample data out of the Students sheet: every filled row is treated as a student.",
    `Upload the file as .xlsx, at most ${ROSTER_MAX_FILE_SIZE_BYTES / BYTES_PER_MEGABYTE} MB.`,
    "In a class import, a filled Class Name overrides the class you are importing into. Leave it blank to use the current class.",
    "When adding existing students to an exam, accounts are matched by Email or Student Code and no new account is created.",
  ],
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
