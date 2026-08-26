import * as XLSX from "xlsx";
import type { RosterFileResult, RosterRow } from "./types";

const MAX_SHEETS_TO_SCAN = 20;
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB — a roster of a few thousand rows fits well under this

const HEADER_ALIASES: Record<string, keyof RosterRow> = {
  email: "email",
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
  return header.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
}

function formatIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * `raw: true` (below) + `cellDates: true` (on the workbook read) so a
 * genuine Excel date cell (dateOfBirth's expected column) comes through as
 * a JS `Date`, formatted here to ISO `yyyy-MM-dd`. Fixed a real bug
 * (quality-gate QUAL-003): the original `raw: false` mode formatted date
 * cells as a locale display string (e.g. "1/15/08"), which the backend's
 * `LocalDate` parser would reject or, worse, misinterpret (MM/DD vs
 * DD/MM). A manually-typed text date (already ISO) or any other text/number
 * field passes through unaffected — `raw: true` only changes how
 * already-typed date/number cells are handed back, not how string cells
 * are read.
 */
function toCellText(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return formatIsoDate(value);
  return String(value).trim();
}

export async function parseRosterFile(file: File): Promise<RosterFileResult> {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error(`Import file is too large (max ${MAX_FILE_SIZE_BYTES / (1024 * 1024)}MB)`);
  }

  const workbook = XLSX.read(await file.arrayBuffer(), {
    type: "array",
    cellDates: true,
  });

  for (const sheetName of workbook.SheetNames.slice(0, MAX_SHEETS_TO_SCAN)) {
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) continue;

    const rawRows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
      header: 1,
      blankrows: false,
      defval: "",
      raw: true,
    });
    const rows = extractRosterRows(rawRows);
    if (rows.length > 0) return { fileName: file.name, rows };
  }

  throw new Error(
    "Import file must contain a header row (Email, Full Name, Student Code, Class, Phone, Date of Birth) and at least one data row",
  );
}

function extractRosterRows(rawRows: unknown[][]): RosterRow[] {
  if (rawRows.length < 2) return [];

  const rawHeaders = rawRows[0] ?? [];
  const fieldByColumn = rawHeaders.map((header) => HEADER_ALIASES[normalizeHeader(toCellText(header))]);

  if (!fieldByColumn.includes("email") || !fieldByColumn.includes("fullName")) {
    throw new Error("Import file must have both an Email column and a Full Name column");
  }

  return rawRows.slice(1).flatMap((rawRow) => {
    const row: Partial<RosterRow> = {};
    fieldByColumn.forEach((field, index) => {
      if (!field) return;
      const value = toCellText(rawRow[index]);
      if (value) row[field] = value;
    });

    if (!row.email && !row.fullName) return [];
    return [{ email: row.email ?? "", fullName: row.fullName ?? "", ...row }];
  });
}
