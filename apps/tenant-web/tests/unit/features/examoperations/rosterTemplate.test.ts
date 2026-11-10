import * as XLSX from "xlsx";
import { describe, expect, it } from "vitest";
import {
  parseRosterFile,
  resolveTemplateField,
} from "../../../../features/examoperations/cleanRosterFile";
import {
  ROSTER_FILE_ERRORS,
  ROSTER_SAMPLE_ROW_MARKER,
  ROSTER_TEMPLATE_COLUMNS,
  ROSTER_TEMPLATE_FORMATTED_ROWS,
  ROSTER_TEMPLATE_SHEETS,
} from "../../../../features/examoperations/constants";
import { buildRosterTemplateWorkbook } from "../../../../features/examoperations/rosterTemplate";

/** Row 1 is the header, row 2 the sample row; student data starts at array index 2. */
const FIRST_DATA_ROW_INDEX = 2;

function toXlsxFile(workbook: XLSX.WorkBook, fileName = "template.xlsx"): File {
  const bytes: ArrayBuffer = XLSX.write(workbook, { type: "array", bookType: "xlsx" });
  return new File([bytes], fileName);
}

function studentsSheetOf(workbook: XLSX.WorkBook): XLSX.WorkSheet {
  const sheet = workbook.Sheets[ROSTER_TEMPLATE_SHEETS.STUDENTS];
  if (!sheet) throw new Error("Students sheet is missing");
  return sheet;
}

describe("roster template definition", () => {
  it.each(ROSTER_TEMPLATE_COLUMNS.map((column) => [column.header, column.field] as const))(
    "header %j resolves back to field %s in the strict parser",
    (header, field) => {
      expect(resolveTemplateField(header)).toBe(field);
    },
  );

  it("puts Email first and marks Email and Full Name as the only required columns", () => {
    const fields = ROSTER_TEMPLATE_COLUMNS.map((column) => column.field);
    const required = ROSTER_TEMPLATE_COLUMNS.filter((column) => column.required);

    expect(new Set(fields).size).toBe(fields.length);
    expect(fields).toEqual([
      "email",
      "fullName",
      "studentCode",
      "programName",
      "className",
      "phone",
      "dateOfBirth",
    ]);
    expect(required.map((column) => column.field)).toEqual(["email", "fullName"]);
  });

  it("tells users to enter leading-zero columns as Text", () => {
    const textColumns = ROSTER_TEMPLATE_COLUMNS.filter((column) => column.forceText);

    expect(textColumns.map((column) => column.field)).toEqual(["studentCode", "phone"]);
    textColumns.forEach((column) => expect(column.format).toMatch(/^Text.*leading zeros/));
  });
});

describe("buildRosterTemplateWorkbook", () => {
  it("has the Students sheet first and the Instructions sheet second", () => {
    expect(buildRosterTemplateWorkbook().SheetNames).toEqual([
      ROSTER_TEMPLATE_SHEETS.STUDENTS,
      ROSTER_TEMPLATE_SHEETS.INSTRUCTIONS,
    ]);
  });

  it("puts the header row and one marked sample row with notes on the Students sheet", () => {
    const rows = XLSX.utils.sheet_to_json<unknown[]>(studentsSheetOf(buildRosterTemplateWorkbook()), {
      header: 1,
      blankrows: false,
    });
    const rowsWithValues = rows.filter((row) => row.some((cell) => cell !== ""));

    expect(rowsWithValues).toEqual([
      ROSTER_TEMPLATE_COLUMNS.map((column) => column.header),
      ROSTER_TEMPLATE_COLUMNS.map((column) => column.sample),
    ]);
    expect(rowsWithValues[1]?.[0]).toBe(ROSTER_SAMPLE_ROW_MARKER);
  });

  it("writes the Text number format into the Phone and Student Code data cells of the file", () => {
    const bytes: ArrayBuffer = XLSX.write(buildRosterTemplateWorkbook(), { type: "array", bookType: "xlsx" });
    const sheet = studentsSheetOf(XLSX.read(bytes, { type: "array", cellNF: true }));
    const lastDataRowIndex = FIRST_DATA_ROW_INDEX + ROSTER_TEMPLATE_FORMATTED_ROWS - 1;

    ROSTER_TEMPLATE_COLUMNS.forEach((column, index) => {
      if (!column.forceText) return;
      expect(sheet[XLSX.utils.encode_cell({ r: FIRST_DATA_ROW_INDEX, c: index })]?.z).toBe("@");
      expect(sheet[XLSX.utils.encode_cell({ r: lastDataRowIndex, c: index })]?.z).toBe("@");
    });
  });

  it("is rejected as empty when uploaded untouched, because the sample row is skipped", async () => {
    await expect(parseRosterFile(toXlsxFile(buildRosterTemplateWorkbook()))).rejects.toMatchObject({
      userMessage: ROSTER_FILE_ERRORS.NO_DATA_ROWS,
    });
  });

  it("parses the rows a tenant fills in from row 3", async () => {
    const workbook = buildRosterTemplateWorkbook();
    XLSX.utils.sheet_add_aoa(
      studentsSheetOf(workbook),
      [
        ["alice@example.com", "Alice", "SE001", "PTE Academic", "Class A", "0900000001", "2008-01-15"],
        ["bob@example.com", "Bob"],
      ],
      { origin: "A3" },
    );

    const result = await parseRosterFile(toXlsxFile(workbook));

    expect(result.rows).toEqual([
      {
        email: "alice@example.com",
        fullName: "Alice",
        studentCode: "SE001",
        programName: "PTE Academic",
        className: "Class A",
        phone: "0900000001",
        dateOfBirth: "2008-01-15",
        sourceRow: 3,
      },
      { email: "bob@example.com", fullName: "Bob", sourceRow: 4 },
    ]);
    expect(result.rowIssues).toEqual([]);
  });
});
