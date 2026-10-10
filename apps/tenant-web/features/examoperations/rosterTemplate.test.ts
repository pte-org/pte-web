import * as XLSX from "xlsx";
import { describe, expect, it } from "vitest";
import { parseRosterFile, resolveRosterField } from "./cleanRosterFile";
import {
  ROSTER_FILE_ERRORS,
  ROSTER_TEMPLATE_COLUMNS,
  ROSTER_TEMPLATE_FORMATTED_ROWS,
  ROSTER_TEMPLATE_SHEETS,
} from "./constants";
import { buildRosterTemplateWorkbook } from "./rosterTemplate";

function toXlsxFile(workbook: XLSX.WorkBook, fileName = "template.xlsx"): File {
  const bytes: ArrayBuffer = XLSX.write(workbook, { type: "array", bookType: "xlsx" });
  return new File([bytes], fileName);
}

describe("roster template definition", () => {
  it.each(ROSTER_TEMPLATE_COLUMNS.map((column) => [column.header, column.field] as const))(
    "header %j resolves back to field %s in the parser",
    (header, field) => {
      expect(resolveRosterField(header)).toBe(field);
    },
  );

  it("tells users to enter leading-zero columns as Text", () => {
    const textColumns = ROSTER_TEMPLATE_COLUMNS.filter(
      (column) => column.field === "phone" || column.field === "studentCode",
    );

    expect(textColumns).toHaveLength(2);
    textColumns.forEach((column) => expect(column.format).toMatch(/^Text.*leading zeros/));
  });

  it("declares each field once and marks Full Name as the only required column", () => {
    const fields = ROSTER_TEMPLATE_COLUMNS.map((column) => column.field);
    const required = ROSTER_TEMPLATE_COLUMNS.filter((column) => column.required);

    expect(new Set(fields).size).toBe(fields.length);
    expect(required.map((column) => column.field)).toEqual(["fullName"]);
  });
});

describe("buildRosterTemplateWorkbook", () => {
  it("has the Students sheet first and the Instructions sheet second", () => {
    const workbook = buildRosterTemplateWorkbook();

    expect(workbook.SheetNames).toEqual([
      ROSTER_TEMPLATE_SHEETS.STUDENTS,
      ROSTER_TEMPLATE_SHEETS.INSTRUCTIONS,
    ]);
  });

  it("puts only the header row on the Students sheet so no sample row can be imported", () => {
    const workbook = buildRosterTemplateWorkbook();
    const studentsSheet = workbook.Sheets[ROSTER_TEMPLATE_SHEETS.STUDENTS];
    if (!studentsSheet) throw new Error("Students sheet is missing");

    const rows = XLSX.utils.sheet_to_json<unknown[]>(studentsSheet, {
      header: 1,
      blankrows: false,
    });

    const rowsWithValues = rows.filter((row) => row.some((cell) => cell !== ""));

    expect(rowsWithValues).toEqual([ROSTER_TEMPLATE_COLUMNS.map((column) => column.header)]);
  });

  it("writes the Text number format into the Phone and Student Code cells of the file", () => {
    const bytes: ArrayBuffer = XLSX.write(buildRosterTemplateWorkbook(), {
      type: "array",
      bookType: "xlsx",
    });
    const reloaded = XLSX.read(bytes, { type: "array", cellNF: true });
    const sheet = reloaded.Sheets[ROSTER_TEMPLATE_SHEETS.STUDENTS];
    if (!sheet) throw new Error("Students sheet is missing");

    const textColumns = ROSTER_TEMPLATE_COLUMNS.map((column, index) => ({ column, index })).filter(
      ({ column }) => column.forceText,
    );
    expect(textColumns.map(({ column }) => column.field)).toEqual(["studentCode", "phone"]);
    textColumns.forEach(({ index }) => {
      const firstRow = sheet[XLSX.utils.encode_cell({ r: 1, c: index })];
      const lastRow =
        sheet[XLSX.utils.encode_cell({ r: ROSTER_TEMPLATE_FORMATTED_ROWS, c: index })];
      expect(firstRow?.z).toBe("@");
      expect(lastRow?.z).toBe("@");
    });
  });

  it("is rejected as empty, not parsed from the Instructions sheet, when uploaded untouched", async () => {
    const file = toXlsxFile(buildRosterTemplateWorkbook());

    await expect(parseRosterFile(file)).rejects.toMatchObject({
      userMessage: ROSTER_FILE_ERRORS.NO_DATA_ROWS,
    });
  });

  it("parses the rows a tenant fills into the Students sheet", async () => {
    const workbook = buildRosterTemplateWorkbook();
    const studentsSheet = workbook.Sheets[ROSTER_TEMPLATE_SHEETS.STUDENTS];
    if (!studentsSheet) throw new Error("Students sheet is missing");
    XLSX.utils.sheet_add_aoa(
      studentsSheet,
      [["Alice", "alice@example.com", "SE001", "Class A", "0900000001", "2008-01-15"], ["Bob"]],
      { origin: "A2" },
    );

    const result = await parseRosterFile(toXlsxFile(workbook));

    expect(result.rows).toEqual([
      {
        fullName: "Alice",
        email: "alice@example.com",
        studentCode: "SE001",
        className: "Class A",
        phone: "0900000001",
        dateOfBirth: "2008-01-15",
      },
      { fullName: "Bob" },
    ]);
  });
});
