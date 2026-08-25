import * as XLSX from "xlsx";
import type { PrepareImportRequest } from "@pte/api-client";

const MAX_SHEETS_TO_SCAN = 20;

export async function parseAndCleanRosterFile(
  file: File,
): Promise<PrepareImportRequest> {
  const workbook = XLSX.read(await file.arrayBuffer(), {
    type: "array",
    cellDates: false,
  });

  for (const sheetName of workbook.SheetNames.slice(0, MAX_SHEETS_TO_SCAN)) {
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) continue;

    const rawRows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
      header: 1,
      blankrows: false,
      defval: "",
      raw: false,
    });
    const cleaned = cleanRows(file.name, rawRows);
    if (cleaned.rows.length > 0) return cleaned;
  }

  throw new Error("Import file must contain a header row and at least one data row");
}

function cleanRows(fileName: string, rawRows: unknown[][]): PrepareImportRequest {
  if (rawRows.length < 2) {
    return { fileName, columnHeaders: [], rows: [] };
  }

  const rawHeaders = rawRows[0] ?? [];
  const keptColumns = rawHeaders
    .map((header, index) => ({
      header: toCellText(header),
      index,
    }))
    .filter((column) => column.header.length > 0);
  const columnHeaders = dedupeHeaders(keptColumns.map((column) => column.header));

  if (columnHeaders.length === 0) {
    return { fileName, columnHeaders: [], rows: [] };
  }

  const rows = rawRows.slice(1).flatMap((rawRow) => {
    const row = keptColumns.reduce<Record<string, string>>((values, column, index) => {
      values[columnHeaders[index] ?? column.header] = toCellText(rawRow[column.index]);
      return values;
    }, {});

    const hasValue = Object.values(row).some((value) => value.length > 0);
    return hasValue ? [row] : [];
  });

  return { fileName, columnHeaders, rows };
}

function toCellText(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function dedupeHeaders(headers: string[]): string[] {
  const counts = new Map<string, number>();
  return headers.map((header) => {
    const count = counts.get(header) ?? 0;
    counts.set(header, count + 1);
    return count === 0 ? header : `${header}_${count + 1}`;
  });
}
