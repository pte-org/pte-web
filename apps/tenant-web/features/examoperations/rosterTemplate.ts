import * as XLSX from "xlsx";
import {
  ROSTER_TEMPLATE_COLUMNS,
  ROSTER_TEMPLATE_FILE_NAME,
  ROSTER_TEMPLATE_SHEETS,
  ROSTER_TEMPLATE_TEXT as T,
} from "./constants";

const MIN_COLUMN_WIDTH = 14;
const HEADER_WIDTH_PADDING = 4;
const NOTES_COLUMN_WIDTH = 60;
const FORMAT_COLUMN_WIDTH = 36;
const EXAMPLE_COLUMN_WIDTH = 24;

function buildStudentsSheet(): XLSX.WorkSheet {
  const headers = ROSTER_TEMPLATE_COLUMNS.map((column) => column.header);
  const sheet = XLSX.utils.aoa_to_sheet([headers]);
  sheet["!cols"] = headers.map((header) => ({
    wch: Math.max(header.length + HEADER_WIDTH_PADDING, MIN_COLUMN_WIDTH),
  }));
  return sheet;
}

function buildInstructionsSheet(): XLSX.WorkSheet {
  const rows: string[][] = [
    [T.INSTRUCTIONS_TITLE],
    [],
    [T.COLUMN_HEADER, T.REQUIRED_HEADER, T.FORMAT_HEADER, T.EXAMPLE_HEADER],
    ...ROSTER_TEMPLATE_COLUMNS.map((column) => [
      column.header,
      column.required ? T.REQUIRED_YES : T.REQUIRED_NO,
      column.format,
      column.example,
    ]),
    [],
    [T.NOTES_TITLE],
    ...T.NOTES.map((note) => [note]),
  ];
  const sheet = XLSX.utils.aoa_to_sheet(rows);
  sheet["!cols"] = [
    { wch: NOTES_COLUMN_WIDTH },
    { wch: MIN_COLUMN_WIDTH },
    { wch: FORMAT_COLUMN_WIDTH },
    { wch: EXAMPLE_COLUMN_WIDTH },
  ];
  return sheet;
}

/**
 * The `Students` sheet holds the header row only: example values live on the
 * `Instructions` sheet so a template that is uploaded untouched can never import
 * a sample row as a real student.
 */
export function buildRosterTemplateWorkbook(): XLSX.WorkBook {
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, buildStudentsSheet(), ROSTER_TEMPLATE_SHEETS.STUDENTS);
  XLSX.utils.book_append_sheet(
    workbook,
    buildInstructionsSheet(),
    ROSTER_TEMPLATE_SHEETS.INSTRUCTIONS,
  );
  return workbook;
}

export function downloadRosterTemplate(fileName = ROSTER_TEMPLATE_FILE_NAME): void {
  XLSX.writeFile(buildRosterTemplateWorkbook(), fileName);
}
