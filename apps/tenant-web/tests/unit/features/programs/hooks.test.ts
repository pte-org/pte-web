import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const hoisted = vi.hoisted(() => ({
  locale: "en" as "en" | "vi",
}));

vi.mock("@pte/ui", () => ({
  useLocale: () => ({
    locale: hoisted.locale,
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

import { useProgramDetailText } from "../../../../features/programs/hooks/useProgramDetailText";
import { useCreateProgramText } from "../../../../features/programs/hooks/useCreateProgramText";
import { validateCreateProgram } from "../../../../features/programs/utils/validateCreateProgram";
import {
  PROGRAM_DETAIL_EN,
  PROGRAM_DETAIL_VI,
} from "../../../../features/programs/constants/detailMessages";
import {
  CREATE_PROGRAM_EN,
  CREATE_PROGRAM_VI,
} from "../../../../features/programs/constants/createProgramMessages";

beforeEach(() => {
  hoisted.locale = "en";
});

describe("useProgramDetailText", () => {
  it("resolves English copy and archiveImpact helper", () => {
    let text!: ReturnType<typeof useProgramDetailText>;
    renderToStaticMarkup(
      createElement(() => {
        text = useProgramDetailText();
        return null;
      }),
    );

    expect(text.locale).toBe("en");
    expect(text.classes).toBe(PROGRAM_DETAIL_EN.classes);
    expect(text.classList).toBe(PROGRAM_DETAIL_EN.classList);

    const impact = text.archiveImpact(3, 10);
    expect(impact).toContain("3");
    expect(impact).toContain("10");
  });

  it("resolves Vietnamese copy when locale is vi", () => {
    hoisted.locale = "vi";
    let text!: ReturnType<typeof useProgramDetailText>;
    renderToStaticMarkup(
      createElement(() => {
        text = useProgramDetailText();
        return null;
      }),
    );

    expect(text.locale).toBe("vi");
    expect(text.classes).toBe(PROGRAM_DETAIL_VI.classes);
    expect(text.classList).toBe(PROGRAM_DETAIL_VI.classList);
  });
});

describe("useCreateProgramText", () => {
  it("resolves English copy and formats labels with program name", () => {
    let text!: ReturnType<typeof useCreateProgramText>;
    renderToStaticMarkup(
      createElement(() => {
        text = useCreateProgramText("Program");
        return null;
      }),
    );

    expect(text.locale).toBe("en");
    expect(text.title).toBe("Create Program");
    expect(text.nameLabel).toBe("Program name");
    expect(text.namePlaceholder).toBe("e.g. Program 12");
    expect(text.descriptionLabel).toBe("Description");
    expect(text.startDateLabel).toBe("Start date");
    expect(text.endDateLabel).toBe("End date");
    expect(text.dateOptionalHint).toBe("Optional — leave blank if there is no time limit");
    expect(text.cancel).toBe("Cancel");
    expect(text.submit).toBe("Create Program");
    expect(text.submitting).toBe("Creating...");
    expect(text.nameRequired).toBe("Program name is required.");
    expect(text.endDateBeforeStartDate).toBe("End date must be on or after the start date.");
  });

  it("resolves Vietnamese copy and formats labels in Vietnamese", () => {
    hoisted.locale = "vi";
    let text!: ReturnType<typeof useCreateProgramText>;
    renderToStaticMarkup(
      createElement(() => {
        text = useCreateProgramText("Chương trình");
        return null;
      }),
    );

    expect(text.locale).toBe("vi");
    expect(text.title).toBe("Tạo chương trình");
    expect(text.nameLabel).toBe("Tên chương trình");
    expect(text.namePlaceholder).toBe("Ví dụ: Chương trình 12");
    expect(text.descriptionLabel).toBe("Mô tả");
    expect(text.startDateLabel).toBe("Ngày bắt đầu");
    expect(text.endDateLabel).toBe("Ngày kết thúc");
    expect(text.dateOptionalHint).toBe("Không bắt buộc — bỏ trống nếu không giới hạn thời gian");
    expect(text.cancel).toBe("Hủy");
    expect(text.submit).toBe("Tạo chương trình");
    expect(text.submitting).toBe("Đang tạo...");
    expect(text.nameRequired).toBe("Vui lòng nhập tên chương trình.");
    expect(text.endDateBeforeStartDate).toBe("Ngày kết thúc phải bằng hoặc sau ngày bắt đầu.");
  });
});

describe("validateCreateProgram", () => {
  it("uses default English error messages when not provided", () => {
    const errors = validateCreateProgram(
      { name: "  ", description: "", startDate: "2026-12-10", endDate: "2026-12-01" },
      "Program",
    );
    expect(errors.name).toBe("Program name is required.");
    expect(errors.endDate).toBe("End date must be on or after the start date.");
  });

  it("uses custom localized error messages when provided", () => {
    const errors = validateCreateProgram(
      { name: "", description: "", startDate: "2026-12-10", endDate: "2026-12-01" },
      "Chương trình",
      {
        nameRequired: "Vui lòng nhập tên chương trình.",
        endDateBeforeStartDate: "Ngày kết thúc phải bằng hoặc sau ngày bắt đầu.",
      },
    );
    expect(errors.name).toBe("Vui lòng nhập tên chương trình.");
    expect(errors.endDate).toBe("Ngày kết thúc phải bằng hoặc sau ngày bắt đầu.");
  });
});

