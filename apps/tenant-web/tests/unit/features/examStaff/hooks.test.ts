import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@pte/ui", () => ({
  useLocale: () => ({
    locale: "en",
    t: (_key: string, fallback?: string, values?: Record<string, string | number>) => {
      let str = fallback ?? _key;
      if (values) {
        for (const [k, v] of Object.entries(values)) {
          str = str.replace(`{${k}}`, String(v));
        }
      }
      return str;
    },
  }),
}));

import { useExamStaffListText } from "../../../../features/examStaff/hooks/useExamStaffListText";
import { useExamStaffListColumns } from "../../../../features/examStaff/hooks/useExamStaffListColumns";
import { EXAM_STAFF_TEXT } from "../../../../features/examStaff/constants";
import type { UserResponse } from "@pte/api-client";

describe("useExamStaffListText", () => {
  it("resolves staff list copy with confirm description formatters", () => {
    let text!: ReturnType<typeof useExamStaffListText>;
    renderToStaticMarkup(
      createElement(() => {
        text = useExamStaffListText();
        return null;
      }),
    );

    expect(text.fullName).toBe(EXAM_STAFF_TEXT.fullName);
    expect(text.addButton).toBe(EXAM_STAFF_TEXT.addButton);
    expect(text.proctor).toBe(EXAM_STAFF_TEXT.proctor);
    expect(text.examiner).toBe(EXAM_STAFF_TEXT.examiner);

    const suspendDesc = text.confirmSuspendDescription("Staff One");
    expect(suspendDesc).toContain("Staff One");

    const emailDesc = text.sendEmailConfirmDescription("Staff Two");
    expect(emailDesc).toContain("Staff Two");
  });

  it("useExamStaffListColumns configures column formatters and badges", () => {
    let columns!: ReturnType<typeof useExamStaffListColumns>;
    renderToStaticMarkup(
      createElement(() => {
        const text = useExamStaffListText();
        columns = useExamStaffListColumns(text);
        return null;
      }),
    );

    expect(columns).toHaveLength(4);
    const sampleStaff: UserResponse = {
      publicId: "u-1",
      username: "staff1",
      fullName: "Staff One",
      email: "staff1@test.com",
      status: "ACTIVE",
      roles: ["EXAMINER"],
      tenantId: "t1",
      studentCode: null,
      className: null,
      phone: null,
      dateOfBirth: null,
      mustChangePassword: false,
      archived: false,
    };

    expect(columns[0].cell(sampleStaff)).toBe("Staff One");
    expect(columns[1].cell(sampleStaff)).toBe("staff1@test.com");
    expect(columns[2].cell(sampleStaff)).toBe("Examiner");
  });
});
