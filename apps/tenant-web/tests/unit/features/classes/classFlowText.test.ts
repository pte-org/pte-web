import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const hoisted = vi.hoisted(() => ({ locale: "en" as "en" | "vi" }));

vi.mock("@pte/ui", () => ({
  useLocale: () => ({
    locale: hoisted.locale,
    t: (_key: string, fallback?: string, values?: Record<string, string | number>) =>
      (fallback ?? _key).replace(/\{(\w+)\}/g, (_, k: string) => String(values?.[k] ?? `{${k}}`)),
  }),
}));

import { useClassFlowText } from "../../../../features/classes/hooks/useClassFlowText";
import {
  CLASS_FLOW_EN,
  CLASS_FLOW_VI,
} from "../../../../features/classes/constants/classFlowMessages";
import {
  STUDENT_IMPORT_EN,
  STUDENT_IMPORT_VI,
} from "../../../../features/classes/constants/studentImportMessages";
import { validateAddStudentInput } from "../../../../features/classes/utils/validateAddStudentInput";

const render = (label: string): ReturnType<typeof useClassFlowText> => {
  let tf!: ReturnType<typeof useClassFlowText>;
  renderToStaticMarkup(
    createElement(() => {
      tf = useClassFlowText(label);
      return null;
    }),
  );
  return tf;
};

beforeEach(() => {
  hoisted.locale = "en";
});

describe("class flow catalogs", () => {
  it("vi and en have the same keys", () => {
    expect(Object.keys(CLASS_FLOW_VI).sort()).toEqual(Object.keys(CLASS_FLOW_EN).sort());
    expect(Object.keys(STUDENT_IMPORT_VI).sort()).toEqual(Object.keys(STUDENT_IMPORT_EN).sort());
  });

  it("vi templates use only placeholders also present in en", () => {
    const placeholders = (s: string): string[] => (s.match(/\{\w+\}/g) ?? []).sort();
    const allowed = ["{label}", "{labelLower}", "{labels}", "{labelsLower}"];
    for (const key of Object.keys(CLASS_FLOW_EN) as (keyof typeof CLASS_FLOW_EN)[]) {
      const en = new Set([...placeholders(CLASS_FLOW_EN[key]), ...allowed]);
      for (const p of placeholders(CLASS_FLOW_VI[key])) expect(en.has(p)).toBe(true);
    }
  });
});

describe("useClassFlowText", () => {
  it("renders English labels with dynamic org label", () => {
    const tf = render("Class");
    expect(tf("exportButton")).toBe("Export to Excel");
    expect(tf("splitStart")).toBe("Split Class");
    expect(tf("mergeStart")).toBe("Merge Classes");
    expect(tf("rowTransfer")).toBe("Transfer");
  });

  it("renders Vietnamese labels", () => {
    hoisted.locale = "vi";
    const tf = render("Lớp học");
    expect(tf("exportButton")).toBe("Xuất Excel");
    expect(tf("splitStart")).toBe("Tách lớp học");
    expect(tf("rowTransfer")).toBe("Chuyển lớp");
    expect(tf("rowUnassign")).toBe("Gỡ khỏi lớp");
    expect(tf("selectedCount", { count: 3 })).toBe("Đã chọn 3");
  });
});

describe("validateAddStudentInput", () => {
  it("uses localized messages when provided", () => {
    const errors = validateAddStudentInput(
      { email: "", fullName: "", studentCode: "", phone: "", dateOfBirth: "" },
      STUDENT_IMPORT_VI,
    );
    expect(errors.email).toBe("Vui lòng nhập email.");
    expect(errors.fullName).toBe("Vui lòng nhập họ và tên.");
  });
});
