import { describe, expect, it } from "vitest";
import { formatProgramDateRange } from "../../../../features/programs/utils/formatProgramDates";

const VI_TEXT = {
  ongoing: "Không giới hạn",
  untilDate: (date: string) => `Đến ${date}`,
};

const EN_TEXT = {
  ongoing: "Ongoing",
  untilDate: (date: string) => `Until ${date}`,
};

describe("formatProgramDateRange", () => {
  it("formats full range when both dates are present", () => {
    expect(formatProgramDateRange("2026-12-01", "2026-12-31", VI_TEXT)).toBe(
      "01/12/2026 – 31/12/2026",
    );
    expect(formatProgramDateRange("2026-12-01", "2026-12-31", EN_TEXT)).toBe(
      "01/12/2026 – 31/12/2026",
    );
  });

  it("formats open-ended end date clearly in both languages", () => {
    expect(formatProgramDateRange("2026-12-01", null, VI_TEXT)).toBe("01/12/2026 – Không giới hạn");
    expect(formatProgramDateRange("2026-12-01", null, EN_TEXT)).toBe("01/12/2026 – Ongoing");
  });

  it("formats end-date-only range clearly in both languages", () => {
    expect(formatProgramDateRange(null, "2026-12-31", VI_TEXT)).toBe("Đến 31/12/2026");
    expect(formatProgramDateRange(null, "2026-12-31", EN_TEXT)).toBe("Until 31/12/2026");
  });

  it("formats missing both dates clearly in both languages", () => {
    expect(formatProgramDateRange(null, null, VI_TEXT)).toBe("Không giới hạn");
    expect(formatProgramDateRange(null, null, EN_TEXT)).toBe("Ongoing");
  });
});
