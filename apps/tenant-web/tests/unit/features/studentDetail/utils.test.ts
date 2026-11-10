import { describe, expect, it } from "vitest";
import type { StudentDetailResponse } from "@pte/api-client";
import {
  formFromAccount,
  formatStudentDate,
  reportStateVariant,
} from "@/features/studentDetail/utils";

describe("features/studentDetail/utils", () => {
  it("maps StudentDetailResponse to form state", () => {
    const account: StudentDetailResponse = {
      publicId: "stu-1",
      fullName: "Alice Student",
      email: "alice@test.com",
      phone: "123456789",
      dateOfBirth: "2000-01-01",
      roles: ["STUDENT"],
      status: "ACTIVE",
      createdAt: "2026-01-01T00:00:00Z",
    } as unknown as StudentDetailResponse;

    expect(formFromAccount(account)).toEqual({
      fullName: "Alice Student",
      email: "alice@test.com",
      phone: "123456789",
      dateOfBirth: "2000-01-01",
    });

    const emptyAccount = {
      publicId: "stu-2",
      roles: ["STUDENT"],
      status: "ACTIVE",
    } as unknown as StudentDetailResponse;

    expect(formFromAccount(emptyAccount)).toEqual({
      fullName: "",
      email: "",
      phone: "",
      dateOfBirth: "",
    });
  });

  it("formatStudentDate formats date in en and vi locales", () => {
    const iso = "2026-05-15T10:30:00.000Z";
    expect(formatStudentDate(iso, "en")).toContain("2026");
    expect(formatStudentDate(iso, "vi")).toContain("2026");
  });

  it("reportStateVariant returns correct variant", () => {
    expect(reportStateVariant("PUBLISHED")).toBe("success");
    expect(reportStateVariant("UNPUBLISHED")).toBe("warning");
    expect(reportStateVariant("PENDING" as unknown as import("@pte/api-client").StudentHistoryReportState)).toBe("neutral");
  });
});

