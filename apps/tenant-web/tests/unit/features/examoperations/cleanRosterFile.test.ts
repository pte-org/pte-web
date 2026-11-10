import * as XLSX from "xlsx";
import { describe, expect, it } from "vitest";
import {
  parseRosterFile,
  resolveRosterField,
  resolveTemplateField,
} from "../../../../features/examoperations/cleanRosterFile";
import {
  ROSTER_FILE_ERRORS,
  ROSTER_MAX_FILE_SIZE_BYTES,
  ROSTER_ROW_MESSAGES,
  ROSTER_SAMPLE_ROW_MARKER,
  ROSTER_TEMPLATE_COLUMNS,
} from "../../../../features/examoperations/constants";

type SheetRows = unknown[][];

const TEMPLATE_HEADERS = ROSTER_TEMPLATE_COLUMNS.map((column) => column.header);

function toXlsxFile(sheets: Record<string, SheetRows>, fileName = "roster.xlsx"): File {
  const workbook = XLSX.utils.book_new();
  Object.entries(sheets).forEach(([name, rows]) => {
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(rows, { cellDates: true }), name);
  });
  const bytes: ArrayBuffer = XLSX.write(workbook, { type: "array", bookType: "xlsx" });
  return new File([bytes], fileName);
}

/** A template-shaped row: Email, Full Name, Student Code, Program Name, Class Name, Phone, Date of Birth. */
function templateRow(values: Partial<Record<(typeof TEMPLATE_HEADERS)[number], unknown>>): unknown[] {
  return TEMPLATE_HEADERS.map((header) => values[header] ?? "");
}

describe("resolveRosterField (lenient, existing-account matching)", () => {
  it.each([
    ["Full Name", "fullName"],
    ["  e-mail ", "email"],
    ["Phone Number", "phone"],
    ["Account", "username"],
  ])("maps %j to %s", (header, field) => {
    expect(resolveRosterField(header)).toBe(field);
  });
});

describe("resolveTemplateField (strict, create flows)", () => {
  it("accepts every template header, ignoring case and spacing", () => {
    expect(resolveTemplateField("  EMAIL ")).toBe("email");
    expect(resolveTemplateField("program name")).toBe("programName");
    expect(resolveTemplateField("Date of Birth")).toBe("dateOfBirth");
  });

  it.each(["name", "dob", "e-mail address", "Account"])("rejects the alias %j", (header) => {
    expect(resolveTemplateField(header)).toBeUndefined();
  });
});

describe("parseRosterFile (template)", () => {
  it("reads template rows, skips blank cells and records the spreadsheet row", async () => {
    const file = toXlsxFile({
      Students: [
        TEMPLATE_HEADERS,
        templateRow({ Email: "alice@example.com", "Full Name": "Alice" }),
        templateRow({ Email: "bob@example.com", "Full Name": "Bob", "Student Code": "SE001" }),
      ],
    });

    const result = await parseRosterFile(file);

    expect(result.fileName).toBe("roster.xlsx");
    expect(result.rows).toEqual([
      { email: "alice@example.com", fullName: "Alice", sourceRow: 2 },
      { email: "bob@example.com", fullName: "Bob", studentCode: "SE001", sourceRow: 3 },
    ]);
    expect(result.rowIssues).toEqual([]);
  });

  it("skips the template's sample row", async () => {
    const sample = ROSTER_TEMPLATE_COLUMNS.map((column) => column.sample);
    const file = toXlsxFile({
      Students: [TEMPLATE_HEADERS, sample, templateRow({ Email: "a@example.com", "Full Name": "A" })],
    });

    const result = await parseRosterFile(file);

    expect(result.rows).toEqual([{ email: "a@example.com", fullName: "A", sourceRow: 3 }]);
    expect(sample[0]).toBe(ROSTER_SAMPLE_ROW_MARKER);
  });

  it("refuses an untouched template because it only holds the sample row", async () => {
    const sample = ROSTER_TEMPLATE_COLUMNS.map((column) => column.sample);
    await expect(parseRosterFile(toXlsxFile({ Students: [TEMPLATE_HEADERS, sample] }))).rejects.toMatchObject({
      userMessage: ROSTER_FILE_ERRORS.NO_DATA_ROWS,
    });
  });

  it("formats an Excel date cell as ISO yyyy-MM-dd", async () => {
    const file = toXlsxFile({
      Students: [
        TEMPLATE_HEADERS,
        templateRow({ Email: "a@example.com", "Full Name": "A", "Date of Birth": new Date(2008, 0, 15) }),
      ],
    });

    expect((await parseRosterFile(file)).rows[0]?.dateOfBirth).toBe("2008-01-15");
  });

  it("rejects a file with a column that is not in the template", async () => {
    const file = toXlsxFile({ Students: [[...TEMPLATE_HEADERS, "Ghi chu"], ["a@example.com", "A"]] });

    await expect(parseRosterFile(file)).rejects.toMatchObject({
      userMessage: ROSTER_FILE_ERRORS.COLUMNS_MISMATCH(["Ghi chu"], []),
    });
  });

  it("rejects a file that misses a required column", async () => {
    const file = toXlsxFile({ Students: [["Full Name", "Phone"], ["A", "0901234567"]] });

    await expect(parseRosterFile(file)).rejects.toMatchObject({
      userMessage: ROSTER_FILE_ERRORS.COLUMNS_MISMATCH([], ["Email"]),
    });
  });

  it("rejects lenient aliases such as Name instead of Full Name", async () => {
    const file = toXlsxFile({ Students: [["Email", "Name"], ["a@example.com", "A"]] });

    await expect(parseRosterFile(file)).rejects.toMatchObject({
      userMessage: ROSTER_FILE_ERRORS.COLUMNS_MISMATCH(["Name"], ["Full Name"]),
    });
  });

  it("reads the Students sheet even when another sheet comes first", async () => {
    const file = toXlsxFile({
      Instructions: [["How to fill in"]],
      Students: [TEMPLATE_HEADERS, templateRow({ Email: "a@example.com", "Full Name": "A" })],
    });

    expect((await parseRosterFile(file)).rows).toHaveLength(1);
  });

  it("reports broken cells with their spreadsheet row instead of rejecting the file", async () => {
    const file = toXlsxFile({
      Students: [
        TEMPLATE_HEADERS,
        templateRow({ "Full Name": "No Email" }),
        templateRow({ Email: "dup@example.com", "Full Name": "A", Phone: "12ab" }),
        templateRow({ Email: "DUP@example.com", "Full Name": "B", "Date of Birth": "2999-01-01" }),
      ],
    });

    const result = await parseRosterFile(file);

    expect(result.rows).toHaveLength(3);
    expect(result.rowIssues).toEqual([
      { row: 2, field: "email", message: ROSTER_ROW_MESSAGES.EMAIL_REQUIRED },
      { row: 3, field: "phone", message: ROSTER_ROW_MESSAGES.PHONE_INVALID },
      { row: 4, field: "email", message: ROSTER_ROW_MESSAGES.DUPLICATE_EMAIL_IN_BATCH },
      { row: 4, field: "dateOfBirth", message: ROSTER_ROW_MESSAGES.DATE_OF_BIRTH_INVALID },
    ]);
  });

  it("rejects an oversized file before reading it", async () => {
    const file = new File([new Uint8Array(ROSTER_MAX_FILE_SIZE_BYTES + 1)], "big.xlsx");

    await expect(parseRosterFile(file)).rejects.toMatchObject({
      userMessage: ROSTER_FILE_ERRORS.TOO_LARGE(ROSTER_MAX_FILE_SIZE_BYTES / (1024 * 1024)),
    });
  });
});

describe("parseRosterFile (matching existing accounts)", () => {
  it("keeps username-only rows and lists unknown columns as ignored", async () => {
    const file = toXlsxFile({ Sheet1: [["Username", "Ghi chu"], ["alice", "x"], ["bob", ""]] });

    const result = await parseRosterFile(file, { allowUsername: true });

    expect(result.rows).toEqual([
      { username: "alice", sourceRow: 2 },
      { username: "bob", sourceRow: 3 },
    ]);
    expect(result.ignoredColumns).toEqual(["Ghi chu"]);
    expect(result.rowIssues).toEqual([]);
  });

  it("asks for the template when no sheet has a recognised header", async () => {
    const file = toXlsxFile({ Sheet1: [["Ghi chu"], ["x"]] });

    await expect(parseRosterFile(file, { allowUsername: true })).rejects.toMatchObject({
      userMessage: ROSTER_FILE_ERRORS.TEMPLATE_REQUIRED(["Ghi chu"], TEMPLATE_HEADERS),
    });
  });
});
