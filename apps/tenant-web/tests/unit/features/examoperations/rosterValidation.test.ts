import { ApiError, ROSTER_VALIDATION_FAILED } from "@pte/api-client";
import { describe, expect, it } from "vitest";
import { ROSTER_ROW_MESSAGES, ROSTER_ROW_UNKNOWN_MESSAGE } from "../../../../features/examoperations/constants";
import { buildBulkCreateRequest } from "../../../../features/examoperations/rosterRequest";
import { rosterServerIssues } from "../../../../features/examoperations/rosterServerIssues";
import { validateRosterRows } from "../../../../features/examoperations/validateRosterRows";

const TODAY = new Date(2026, 10, 9);

describe("validateRosterRows", () => {
  it("accepts a complete row and an optional phone with separators", () => {
    expect(
      validateRosterRows(
        [{ email: "a@example.com", fullName: "A", phone: "+84 901-234.567", dateOfBirth: "2008-01-15" }],
        TODAY,
      ),
    ).toEqual([]);
  });

  it("names the spreadsheet row of every broken cell", () => {
    const issues = validateRosterRows(
      [
        { email: "not-an-email", fullName: "x".repeat(101), sourceRow: 3 },
        { fullName: "B", studentCode: "y".repeat(51), sourceRow: 4 },
        { email: "c@example.com", fullName: "C", dateOfBirth: "2008-02-31", sourceRow: 5 },
        { email: "d@example.com", fullName: "D", dateOfBirth: "2026-11-09", sourceRow: 6 },
      ],
      TODAY,
    );

    expect(issues).toEqual([
      { row: 3, field: "email", message: ROSTER_ROW_MESSAGES.EMAIL_INVALID },
      { row: 3, field: "fullName", message: ROSTER_ROW_MESSAGES.FULL_NAME_TOO_LONG },
      { row: 4, field: "email", message: ROSTER_ROW_MESSAGES.EMAIL_REQUIRED },
      { row: 4, field: "studentCode", message: ROSTER_ROW_MESSAGES.STUDENT_CODE_TOO_LONG },
      { row: 5, field: "dateOfBirth", message: ROSTER_ROW_MESSAGES.DATE_OF_BIRTH_INVALID },
      { row: 6, field: "dateOfBirth", message: ROSTER_ROW_MESSAGES.DATE_OF_BIRTH_INVALID },
    ]);
  });

  it("flags a repeated email regardless of case", () => {
    const issues = validateRosterRows(
      [
        { email: "same@example.com", fullName: "A", sourceRow: 3 },
        { email: "SAME@example.com", fullName: "B", sourceRow: 4 },
      ],
      TODAY,
    );

    expect(issues).toEqual([
      { row: 4, field: "email", message: ROSTER_ROW_MESSAGES.DUPLICATE_EMAIL_IN_BATCH },
    ]);
  });
});

describe("rosterServerIssues", () => {
  const sentRows = [
    { email: "a@example.com", fullName: "A", sourceRow: 3 },
    { email: "b@example.com", fullName: "B", sourceRow: 7 },
  ];

  it("maps backend row errors back to spreadsheet rows and readable messages", () => {
    const error = new ApiError(
      "validation",
      400,
      ROSTER_VALIDATION_FAILED,
      [
        { rowIndex: 1, field: "email", code: "EMAIL_INVALID" },
        { rowIndex: 0, field: "phone", code: "SOMETHING_NEW" },
        { rowIndex: 0, field: "unknownField", code: "EMAIL_INVALID" },
      ],
      { code: ROSTER_VALIDATION_FAILED },
    );

    expect(rosterServerIssues(error, sentRows)).toEqual([
      { row: 7, field: "email", message: ROSTER_ROW_MESSAGES.EMAIL_INVALID },
      { row: 3, field: "phone", message: ROSTER_ROW_UNKNOWN_MESSAGE },
    ]);
  });

  it("returns nothing for any other error", () => {
    expect(rosterServerIssues(new Error("boom"), sentRows)).toEqual([]);
    expect(
      rosterServerIssues(new ApiError("conflict", 409, "x", undefined, { code: "EMAIL_ALREADY_USED" }), sentRows),
    ).toEqual([]);
  });
});

describe("buildBulkCreateRequest", () => {
  it("keeps parser-only fields in the browser and sends blanks as null", () => {
    expect(
      buildBulkCreateRequest({
        rows: [{ email: "a@example.com", fullName: "A", programName: "PTE", sourceRow: 3 }],
        sendCredentialsEmail: true,
      }),
    ).toEqual({
      rows: [
        {
          email: "a@example.com",
          fullName: "A",
          studentCode: null,
          className: null,
          phone: null,
          dateOfBirth: null,
        },
      ],
      tenantId: null,
      sendCredentialsEmail: true,
    });
  });
});
