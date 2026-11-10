import { describe, expect, it } from "vitest";
import { MANAGE_STUDENTS_TEXT } from "../../../../features/studentSearch/constants";
import { MANAGE_STUDENTS_TEXT_VI } from "../../../../features/studentSearch/messages/manageStudentsVi";

describe("add student form copy", () => {
  it("has a Vietnamese entry for every English key", () => {
    expect(Object.keys(MANAGE_STUDENTS_TEXT_VI).sort()).toEqual(
      Object.keys(MANAGE_STUDENTS_TEXT).sort(),
    );
  });

  it("translates the dialog, tabs and upload copy shown in the form", () => {
    const keys = [
      "title",
      "tabAdd",
      "tabImport",
      "fileLabel",
      "fileDescription",
      "reviewFile",
      "close",
    ] as const;
    for (const key of keys) {
      expect(MANAGE_STUDENTS_TEXT_VI[key]).not.toBe(MANAGE_STUDENTS_TEXT[key]);
    }
    expect(MANAGE_STUDENTS_TEXT_VI.title).toBe("Thêm học viên");
  });

  it("formats counts and credential labels in Vietnamese", () => {
    expect(MANAGE_STUDENTS_TEXT_VI.rowsFound(3)).toBe("Tìm thấy 3 dòng");
    expect(MANAGE_STUDENTS_TEXT_VI.accountsCreated(2)).toBe("Đã tạo 2 tài khoản học viên.");
    expect(MANAGE_STUDENTS_TEXT_VI.credentialLabel(null, "sv01")).toContain("học viên");
  });
});
