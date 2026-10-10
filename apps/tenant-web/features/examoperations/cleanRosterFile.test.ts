import * as XLSX from "xlsx";
import { describe, expect, it } from "vitest";
import { parseRosterFile, resolveRosterField } from "./cleanRosterFile";
import {
  ROSTER_FILE_ERRORS,
  ROSTER_MAX_FILE_SIZE_BYTES,
  ROSTER_TEMPLATE_COLUMNS,
} from "./constants";

type SheetRows = unknown[][];

const TEMPLATE_HEADERS = ROSTER_TEMPLATE_COLUMNS.map((column) => column.header);

function toXlsxFile(sheets: Record<string, SheetRows>, fileName = "roster.xlsx"): File {
  const workbook = XLSX.utils.book_new();
  Object.entries(sheets).forEach(([name, rows]) => {
    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.aoa_to_sheet(rows, { cellDates: true }),
      name,
    );
  });
  const bytes: ArrayBuffer = XLSX.write(workbook, { type: "array", bookType: "xlsx" });
  return new File([bytes], fileName);
}

describe("resolveRosterField", () => {
  it.each([
    ["Full Name", "fullName"],
    ["  e-mail ", "email"],
    ["Student Code", "studentCode"],
    ["CLASS NAME", "className"],
    ["Phone Number", "phone"],
    ["Date of Birth", "dateOfBirth"],
    ["Account", "username"],
  ])("maps %j to %s", (header, field) => {
    expect(resolveRosterField(header)).toBe(field);
  });

  it("returns undefined for an unknown header", () => {
    expect(resolveRosterField("Ghi chu")).toBeUndefined();
  });
});

describe("parseRosterFile", () => {
  it("maps known headers to roster fields and skips blank cells", async () => {
    const file = toXlsxFile({
      Students: [
        ["Full Name", "Email", "Student Code"],
        ["Alice", "alice@example.com", ""],
        ["Bob", "", "SE001"],
      ],
    });

    const result = await parseRosterFile(file);

    expect(result.fileName).toBe("roster.xlsx");
    expect(result.rows).toEqual([
      { fullName: "Alice", email: "alice@example.com" },
      { fullName: "Bob", studentCode: "SE001" },
    ]);
  });

  it("formats an Excel date cell as ISO yyyy-MM-dd", async () => {
    const file = toXlsxFile({
      Students: [
        ["Full Name", "Date of Birth"],
        ["Alice", new Date(2008, 0, 15, 12, 0, 0)],
      ],
    });

    const result = await parseRosterFile(file);

    expect(result.rows).toEqual([{ fullName: "Alice", dateOfBirth: "2008-01-15" }]);
  });

  it("drops rows that only carry values in unknown columns", async () => {
    const file = toXlsxFile({
      Students: [
        ["Full Name", "Notes"],
        ["", "just a note"],
        ["Alice", ""],
      ],
    });

    const result = await parseRosterFile(file);

    expect(result.rows).toEqual([{ fullName: "Alice" }]);
  });

  it("does not treat a username-only sheet as importable by default", async () => {
    const file = toXlsxFile({
      Sheet1: [
        ["User", "Last login"],
        ["alice", "2026-01-01"],
        ["bob", "2026-01-02"],
      ],
    });

    await expect(parseRosterFile(file)).rejects.toMatchObject({
      userMessage: ROSTER_FILE_ERRORS.TEMPLATE_REQUIRED(["User", "Last login"], TEMPLATE_HEADERS),
    });
  });

  it("keeps username-only rows when matching existing accounts", async () => {
    const file = toXlsxFile({
      Sheet1: [["Username"], ["alice"], ["bob"]],
    });

    const result = await parseRosterFile(file, { allowUsername: true });

    expect(result.rows).toEqual([{ username: "alice" }, { username: "bob" }]);
  });

  it("rejects a file with no recognised header and asks for the template", async () => {
    const file = toXlsxFile({
      Sheet1: [
        ["Ho ten", "Ghi chu"],
        ["Alice", "x"],
      ],
    });

    await expect(parseRosterFile(file)).rejects.toMatchObject({
      userMessage: ROSTER_FILE_ERRORS.TEMPLATE_REQUIRED(["Ho ten", "Ghi chu"], TEMPLATE_HEADERS),
    });
  });

  it("names the columns found and the columns expected when it rejects a file", async () => {
    const file = toXlsxFile({
      Sheet1: [
        ["Ho ten", "Ghi chu"],
        ["Alice", "x"],
      ],
    });

    const error = await parseRosterFile(file).catch((caught: unknown) => caught);

    expect(error).toMatchObject({ userMessage: expect.stringContaining("Ho ten, Ghi chu") });
    expect(error).toMatchObject({ userMessage: expect.stringContaining("Full Name, Email") });
  });

  it("says so when a rejected file has no header row at all", async () => {
    const file = toXlsxFile({ Sheet1: [[]] });

    await expect(parseRosterFile(file)).rejects.toMatchObject({
      userMessage: ROSTER_FILE_ERRORS.TEMPLATE_REQUIRED([], TEMPLATE_HEADERS),
    });
  });

  it("reports columns that are not in the template as ignored", async () => {
    const file = toXlsxFile({
      Students: [
        ["Full Name", "Ghi chu", "Email", "Lop"],
        ["Alice", "x", "alice@example.com", "A"],
      ],
    });

    const result = await parseRosterFile(file);

    expect(result.ignoredColumns).toEqual(["Ghi chu", "Lop"]);
    expect(result.missingColumns).toEqual([]);
  });

  it("lists a repeated unknown column only once", async () => {
    const file = toXlsxFile({
      Students: [
        ["Full Name", "Notes", "Notes"],
        ["Alice", "x", "y"],
      ],
    });

    const result = await parseRosterFile(file);

    expect(result.ignoredColumns).toEqual(["Notes"]);
  });

  it("reports a missing required column", async () => {
    const file = toXlsxFile({ Students: [["Email"], ["alice@example.com"]] });

    const result = await parseRosterFile(file);

    expect(result.missingColumns).toEqual(["Full Name"]);
  });

  it("does not require Full Name when matching existing accounts", async () => {
    const file = toXlsxFile({ Students: [["Email"], ["alice@example.com"]] });

    const result = await parseRosterFile(file, { allowUsername: true });

    expect(result.missingColumns).toEqual([]);
  });

  it("treats a username column as ignored unless existing accounts are matched", async () => {
    const file = toXlsxFile({
      Students: [
        ["Full Name", "Username"],
        ["Alice", "alice"],
      ],
    });

    expect((await parseRosterFile(file)).ignoredColumns).toEqual(["Username"]);
    expect((await parseRosterFile(file, { allowUsername: true })).ignoredColumns).toEqual([]);
  });

  it("reports missing data rows when the headers are known but nothing is filled in", async () => {
    const file = toXlsxFile({ Students: [["Full Name", "Email"]] });

    await expect(parseRosterFile(file)).rejects.toMatchObject({
      userMessage: ROSTER_FILE_ERRORS.NO_DATA_ROWS,
    });
  });

  it("skips a sheet without known headers and reads the next sheet", async () => {
    const file = toXlsxFile({
      Notes: [["Read me"], ["Some text"]],
      Students: [["Full Name"], ["Alice"]],
    });

    const result = await parseRosterFile(file);

    expect(result.rows).toEqual([{ fullName: "Alice" }]);
  });

  it("rejects a file above the size limit before reading it", async () => {
    const file = new File([new Uint8Array(ROSTER_MAX_FILE_SIZE_BYTES + 1)], "big.xlsx");

    await expect(parseRosterFile(file)).rejects.toMatchObject({
      userMessage: ROSTER_FILE_ERRORS.TOO_LARGE(5),
    });
  });
});
