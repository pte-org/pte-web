import * as XLSX from "xlsx";
import {
  ROSTER_TEMPLATE_COLUMNS,
  ROSTER_TEMPLATE_FILE_NAME,
  ROSTER_TEMPLATE_FORMATTED_ROWS,
  ROSTER_TEMPLATE_SHEETS,
  ROSTER_TEMPLATE_TEXT as T,
} from "./constants";

const MIN_COLUMN_WIDTH = 14;
const HEADER_WIDTH_PADDING = 4;
/** Excel's built-in "Text" number format code. */
const TEXT_NUMBER_FORMAT = "@";
const NOTES_COLUMN_WIDTH = 60;
const FORMAT_COLUMN_WIDTH = 36;
const EXAMPLE_COLUMN_WIDTH = 24;

/**
 * SheetJS community edition cannot style a whole column, so the cells under the Text
 * columns are written as empty text cells with the Text number format. Excel keeps what
 * is typed there as text, so a leading zero in a phone number or student code survives.
 */
function applyTextFormat(sheet: XLSX.WorkSheet): void {
  ROSTER_TEMPLATE_COLUMNS.forEach((column, columnIndex) => {
    if (!column.forceText) return;
    for (let row = 1; row <= ROSTER_TEMPLATE_FORMATTED_ROWS; row += 1) {
      sheet[XLSX.utils.encode_cell({ r: row, c: columnIndex })] = {
        t: "s",
        v: "",
        z: TEXT_NUMBER_FORMAT,
      };
    }
  });
  sheet["!ref"] = XLSX.utils.encode_range({
    s: { r: 0, c: 0 },
    e: { r: ROSTER_TEMPLATE_FORMATTED_ROWS, c: ROSTER_TEMPLATE_COLUMNS.length - 1 },
  });
}

function buildStudentsSheet(): XLSX.WorkSheet {
  const headers = ROSTER_TEMPLATE_COLUMNS.map((column) => column.header);
  const sheet = XLSX.utils.aoa_to_sheet([headers]);
  sheet["!cols"] = headers.map((header) => ({
    wch: Math.max(header.length + HEADER_WIDTH_PADDING, MIN_COLUMN_WIDTH),
  }));
  applyTextFormat(sheet);
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
