import { describe, expect, it } from "vitest";
import { ApiError, type ClassMembershipResponse, type UserResponse } from "@pte/api-client";
import { assignErrorMessage } from "../../../../features/classes/components/assignErrorMessage";
import { IMPORT_OR_ASSIGN_TEXT as T } from "../../../../features/classes/constants";
import { STUDENT_IMPORT_VI } from "../../../../features/classes/constants/studentImportMessages";
import { buildClassRoster } from "../../../../features/classes/utils/buildClassRoster";

const membership: ClassMembershipResponse = {
  publicId: "membership", classPublicId: "class", className: "Future class",
  programPublicId: "program", programName: "Future program", studentPublicId: "student",
};
const student: UserResponse = {
  publicId: "student", username: "student", email: "student@example.test", fullName: "Student",
  tenantId: "tenant", status: "ACTIVE", roles: ["STUDENT"], studentCode: null, className: null,
  phone: null, dateOfBirth: null, mustChangePassword: false, archived: false,
};
const duplicate = (classPublicId?: string): ApiError => new ApiError(
  "conflict", 409, "Conflict", { data: classPublicId ? { existingClassPublicId: classPublicId } : null },
  { code: "STUDENT_ALREADY_IN_CLASS" },
);

describe("class membership management", () => {
  it("includes the selected class and excludes another class", () => {
    const other = { ...membership, publicId: "other", classPublicId: "other-class" };
    expect(buildClassRoster([membership, other], [student], "class")).toEqual([{ membership, student }]);
  });
  it("joins a newly loaded student without changing membership rows", () => {
    const rows = [membership];
    expect(buildClassRoster(rows, [], "class")).toEqual([]);
    expect(buildClassRoster(rows, [student], "class")).toHaveLength(1);
    expect(rows).toEqual([membership]);
  });
  it("reflects updated student details", () => {
    const updated = { ...student, fullName: "Updated name" };
    expect(buildClassRoster([membership], [updated], "class")[0]?.student.fullName).toBe("Updated name");
  });
  it("identifies a duplicate in the current class", () => {
    expect(assignErrorMessage(duplicate("class"), "class")).toBe(T.alreadyInThisClass);
  });
  it("identifies membership in another class", () => {
    expect(assignErrorMessage(duplicate("other"), "class")).toBe(T.alreadyInAnotherClass);
  });
  it("does not assume another class when a race response has no class id", () => {
    expect(assignErrorMessage(duplicate(), "class")).toBe(T.alreadyAssigned);
  });
  it("uses the active locale", () => {
    expect(assignErrorMessage(duplicate("class"), "class", STUDENT_IMPORT_VI))
      .toBe(STUDENT_IMPORT_VI.alreadyInThisClass);
  });
  it("has no error message for an absent error", () => {
    expect(assignErrorMessage(null, "class")).toBeUndefined();
  });
});
