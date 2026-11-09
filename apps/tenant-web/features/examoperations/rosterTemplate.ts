import * as XLSX from "xlsx";
import {
  ROSTER_TEMPLATE_COLUMNS,
  ROSTER_TEMPLATE_FILE_NAME,
  ROSTER_TEMPLATE_FORMATTED_ROWS,
  ROSTER_TEMPLATE_SHEETS,
  ROSTER_TEMPLATE_TEXT as T,
} from "./constants";

const MIN_COLUMN_WIDTH = 14;
const MAX_COLUMN_WIDTH = 48;
const HEADER_WIDTH_PADDING = 4;
/** Excel's built-in "Text" number format code. */
const TEXT_NUMBER_FORMAT = "@";
const NOTES_COLUMN_WIDTH = 60;
const FORMAT_COLUMN_WIDTH = 36;
const EXAMPLE_COLUMN_WIDTH = 24;

/** Row 1 is the header and row 2 the sample row, so student data starts at array index 2. */
const FIRST_DATA_ROW_INDEX = 2;

/**
 * SheetJS community edition cannot style a whole column, so the cells under the Text
 * columns are written as empty text cells with the Text number format. Excel keeps what
 * is typed there as text, so a leading zero in a phone number or student code survives.
 */
function applyTextFormat(sheet: XLSX.WorkSheet): void {
  ROSTER_TEMPLATE_COLUMNS.forEach((column, columnIndex) => {
    if (!column.forceText) return;
    const lastRow = FIRST_DATA_ROW_INDEX + ROSTER_TEMPLATE_FORMATTED_ROWS - 1;
    for (let row = FIRST_DATA_ROW_INDEX; row <= lastRow; row += 1) {
      sheet[XLSX.utils.encode_cell({ r: row, c: columnIndex })] = {
        t: "s",
        v: "",
        z: TEXT_NUMBER_FORMAT,
      };
    }
  });
  sheet["!ref"] = XLSX.utils.encode_range({
    s: { r: 0, c: 0 },
    e: {
      r: FIRST_DATA_ROW_INDEX + ROSTER_TEMPLATE_FORMATTED_ROWS - 1,
      c: ROSTER_TEMPLATE_COLUMNS.length - 1,
    },
  });
}

function buildStudentsSheet(): XLSX.WorkSheet {
  const headers = ROSTER_TEMPLATE_COLUMNS.map((column) => column.header);
  const sampleRow = ROSTER_TEMPLATE_COLUMNS.map((column) => column.sample);
  const sheet = XLSX.utils.aoa_to_sheet([headers, sampleRow]);
  sheet["!cols"] = ROSTER_TEMPLATE_COLUMNS.map((column) => ({
    wch: Math.min(
      Math.max(column.header.length + HEADER_WIDTH_PADDING, column.sample.length, MIN_COLUMN_WIDTH),
      MAX_COLUMN_WIDTH,
    ),
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
 * The `Students` sheet holds the header row and one sample row carrying short notes. The
 * sample row's Email cell is `ROSTER_SAMPLE_ROW_MARKER`, which the parser always skips, so a
 * template uploaded untouched never creates an account.
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
