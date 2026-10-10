import * as XLSX from "xlsx";
import {
  BYTES_PER_MEGABYTE,
  ROSTER_FILE_ERRORS,
  ROSTER_MAX_FILE_SIZE_BYTES,
  ROSTER_TEMPLATE_COLUMNS,
} from "./constants";
import { UserFacingError } from "./errorMessage";
import type { RosterFileResult, RosterRow } from "./types";

const MAX_SHEETS_TO_SCAN = 20;

const HEADER_ALIASES: Record<string, keyof RosterRow> = {
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

/** Maps a raw header cell to the roster field it fills, or undefined when it is not a known column. */
export function resolveRosterField(header: string): keyof RosterRow | undefined {
  return HEADER_ALIASES[normalizeHeader(header)];
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

  let foundKnownHeaders = false;
  let firstSheetHeaders: string[] | undefined;
  for (const sheetName of workbook.SheetNames.slice(0, MAX_SHEETS_TO_SCAN)) {
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) continue;

    const rawRows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
      header: 1,
      blankrows: false,
      defval: "",
      raw: true,
    });
    const extraction = extractRosterRows(rawRows, allowUsername);
    if (extraction.hasKnownHeaders) foundKnownHeaders = true;
    if (!firstSheetHeaders && extraction.headers.length > 0) firstSheetHeaders = extraction.headers;
    if (extraction.rows.length > 0) {
      return {
        fileName: file.name,
        rows: extraction.rows,
        ignoredColumns: extraction.ignoredColumns,
        missingColumns: extraction.missingColumns,
      };
    }
  }

  throw new UserFacingError(
    foundKnownHeaders
      ? ROSTER_FILE_ERRORS.NO_DATA_ROWS
      : ROSTER_FILE_ERRORS.TEMPLATE_REQUIRED(
          firstSheetHeaders ?? [],
          ROSTER_TEMPLATE_COLUMNS.map((column) => column.header),
        ),
  );
}

interface SheetExtraction {
  hasKnownHeaders: boolean;
  /** Non-empty header cells exactly as written in the file. */
  headers: string[];
  ignoredColumns: string[];
  missingColumns: string[];
  rows: RosterRow[];
}

/**
 * A sheet only counts when its first row maps to at least one known column, and a
 * data row only counts when at least one of those columns has a value — otherwise
 * an arbitrary spreadsheet would import as blank rows (anonymous accounts that
 * consume tenant quota). `username` is a known column only when the caller matches
 * existing accounts by it; the create flows never send it, so it cannot make a row real.
 * Required template columns are only reported missing for the create flows, since
 * matching existing accounts needs an identifier, not a full name.
 */
function extractRosterRows(rawRows: unknown[][], allowUsername: boolean): SheetExtraction {
  const rawHeaders = (rawRows[0] ?? []).map((header) => toCellText(header));
  const headers = rawHeaders.filter((header) => header.length > 0);
  const fieldByColumn = rawHeaders.map((header) => {
    const field = resolveRosterField(header);
    return field === "username" && !allowUsername ? undefined : field;
  });
  if (!fieldByColumn.some(Boolean)) {
    return { hasKnownHeaders: false, headers, ignoredColumns: [], missingColumns: [], rows: [] };
  }

  const knownFields = new Set(fieldByColumn.filter(Boolean));
  const ignoredColumns = [
    ...new Set(rawHeaders.filter((header, index) => header && !fieldByColumn[index])),
  ];
  const missingColumns = allowUsername
    ? []
    : ROSTER_TEMPLATE_COLUMNS.filter(
        (column) => column.required && !knownFields.has(column.field),
      ).map((column) => column.header);

  const rows = rawRows.slice(1).flatMap((rawRow) => {
    const row: Partial<RosterRow> = {};
    fieldByColumn.forEach((field, index) => {
      if (!field) return;
      const value = toCellText(rawRow[index]);
      if (value) row[field] = value;
    });

    return Object.keys(row).length > 0 ? [row as RosterRow] : [];
  });

  return { hasKnownHeaders: true, headers, ignoredColumns, missingColumns, rows };
}
