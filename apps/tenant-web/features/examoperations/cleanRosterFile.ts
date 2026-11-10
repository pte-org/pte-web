import * as XLSX from "xlsx";
import {
  BYTES_PER_MEGABYTE,
  ROSTER_FILE_ERRORS,
  ROSTER_MAX_FILE_SIZE_BYTES,
  ROSTER_SAMPLE_ROW_MARKER,
  ROSTER_TEMPLATE_COLUMNS,
  ROSTER_TEMPLATE_SHEETS,
} from "./constants";
import { UserFacingError } from "./errorMessage";
import { validateRosterRows } from "./validateRosterRows";
import type { RosterField, RosterFileResult, RosterRow } from "./types";

const MAX_SHEETS_TO_SCAN = 20;

/** Lenient names, kept only for matching existing accounts (`allowUsername`); create flows use the template. */
const HEADER_ALIASES: Record<string, RosterField> = {
  email: "email",
  username: "username",
  account: "username",
  user: "username",
  fullname: "fullName",
  name: "fullName",
  studentcode: "studentCode",
  code: "studentCode",
  class: "className",
  classname: "className",
  phone: "phone",
  phonenumber: "phone",
  dob: "dateOfBirth",
  dateofbirth: "dateOfBirth",
  birthdate: "dateOfBirth",
};

function normalizeHeader(header: string): string {
  return header
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

const TEMPLATE_FIELD_BY_HEADER: ReadonlyMap<string, RosterField> = new Map(
  ROSTER_TEMPLATE_COLUMNS.map((column) => [normalizeHeader(column.header), column.field]),
);

/** Maps a raw header cell to the roster field it fills, or undefined when it is not a known column. */
export function resolveRosterField(header: string): RosterField | undefined {
  return HEADER_ALIASES[normalizeHeader(header)];
}

/** Exact template header (case, spaces and punctuation ignored); no aliases. */
export function resolveTemplateField(header: string): RosterField | undefined {
  return TEMPLATE_FIELD_BY_HEADER.get(normalizeHeader(header));
}

function formatIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * `raw: true` (below) + `cellDates: true` (on the workbook read) so a
 * genuine Excel date cell comes through as a JS `Date`, formatted here to
 * ISO `yyyy-MM-dd` — otherwise SheetJS formats it as a locale display string
 * (e.g. "1/15/08"), which the backend's `LocalDate` parser misreads (MM/DD
 * vs DD/MM). Text/number cells pass through unaffected.
 */
function toCellText(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return formatIsoDate(value);
  return String(value).trim();
}

export interface ParseRosterFileOptions {
  /** Set when rows identify existing accounts, where a username alone is a valid row. */
  allowUsername?: boolean;
}

function sheetRows(sheet: XLSX.WorkSheet): unknown[][] {
  // blankrows: true keeps array index = spreadsheet row - 1, so a row error can name the row the Host sees.
  return XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    blankrows: true,
    defval: "",
    raw: true,
  });
}

export async function parseRosterFile(
  file: File,
  { allowUsername = false }: ParseRosterFileOptions = {},
): Promise<RosterFileResult> {
  if (file.size > ROSTER_MAX_FILE_SIZE_BYTES) {
    throw new UserFacingError(
      ROSTER_FILE_ERRORS.TOO_LARGE(ROSTER_MAX_FILE_SIZE_BYTES / BYTES_PER_MEGABYTE),
    );
  }

  const workbook = XLSX.read(await file.arrayBuffer(), {
    type: "array",
    cellDates: true,
  });
  return allowUsername ? parseLenient(file.name, workbook) : parseTemplate(file.name, workbook);
}

/**
 * Create flows accept only the PTEPrep template: the Students sheet (or the first sheet) must carry exactly the
 * template headers, and every row is checked before anything is sent. The sample row is skipped.
 */
function parseTemplate(fileName: string, workbook: XLSX.WorkBook): RosterFileResult {
  const sheetName = workbook.SheetNames.includes(ROSTER_TEMPLATE_SHEETS.STUDENTS)
    ? ROSTER_TEMPLATE_SHEETS.STUDENTS
    : workbook.SheetNames[0];
  const sheet = sheetName ? workbook.Sheets[sheetName] : undefined;
  const rawRows = sheet ? sheetRows(sheet) : [];
  const rawHeaders = (rawRows[0] ?? []).map((header) => toCellText(header));
  const fieldByColumn = rawHeaders.map((header) => (header ? resolveTemplateField(header) : undefined));

  const unknownColumns = [...new Set(rawHeaders.filter((header, index) => header && !fieldByColumn[index]))];
  const presentFields = new Set(fieldByColumn.filter(Boolean));
  const missingColumns = ROSTER_TEMPLATE_COLUMNS.filter(
    (column) => column.required && !presentFields.has(column.field),
  ).map((column) => column.header);
  if (unknownColumns.length > 0 || missingColumns.length > 0) {
    throw new UserFacingError(ROSTER_FILE_ERRORS.COLUMNS_MISMATCH(unknownColumns, missingColumns));
  }

  const rows = rawRows.slice(1).flatMap((rawRow, index) => {
    const row = readRow(rawRow, fieldByColumn);
    if (!row || row.email === ROSTER_SAMPLE_ROW_MARKER) return [];
    // +2: array index 0 is spreadsheet row 2 (row 1 is the header).
    return [{ ...row, sourceRow: index + 2 }];
  });
  if (rows.length === 0) throw new UserFacingError(ROSTER_FILE_ERRORS.NO_DATA_ROWS);

  return { fileName, rows, ignoredColumns: [], missingColumns: [], rowIssues: validateRosterRows(rows) };
}

function readRow(rawRow: unknown[], fieldByColumn: readonly (RosterField | undefined)[]): RosterRow | null {
  const row: RosterRow = {};
  fieldByColumn.forEach((field, index) => {
    if (!field) return;
    const value = toCellText(rawRow[index]);
    if (value) row[field] = value;
  });
  return Object.keys(row).length > 0 ? row : null;
}

/** Matching existing accounts: any sheet whose headers resolve through the lenient aliases. */
function parseLenient(fileName: string, workbook: XLSX.WorkBook): RosterFileResult {
  let firstSheetHeaders: string[] | undefined;
  for (const sheetName of workbook.SheetNames.slice(0, MAX_SHEETS_TO_SCAN)) {
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) continue;
    const rawRows = sheetRows(sheet);
    const rawHeaders = (rawRows[0] ?? []).map((header) => toCellText(header));
    if (!firstSheetHeaders) firstSheetHeaders = rawHeaders.filter(Boolean);
    const fieldByColumn = rawHeaders.map((header) => resolveRosterField(header));
    if (!fieldByColumn.some(Boolean)) continue;

    const rows = rawRows.slice(1).flatMap((rawRow, index) => {
      const row = readRow(rawRow, fieldByColumn);
      return row ? [{ ...row, sourceRow: index + 2 }] : [];
    });
    if (rows.length === 0) continue;
    const ignoredColumns = [...new Set(rawHeaders.filter((header, index) => header && !fieldByColumn[index]))];
    return { fileName, rows, ignoredColumns, missingColumns: [], rowIssues: [] };
  }

  throw new UserFacingError(
    ROSTER_FILE_ERRORS.TEMPLATE_REQUIRED(
      firstSheetHeaders ?? [],
      ROSTER_TEMPLATE_COLUMNS.map((column) => column.header),
    ),
  );
}
