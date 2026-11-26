import { describe, expect, it } from "vitest";
import {
  closeAfterOpenChange,
  closesBeforeOpens,
  formatExamWindow,
  suggestExamWindow,
} from "../../../../../features/exams/utils/suggestedExamWindow";

describe("suggestExamWindow", () => {
  it("opens at the next full hour and closes three hours later", () => {
    expect(suggestExamWindow(new Date(2026, 10, 26, 11, 44))).toEqual({
      opensAt: "2026-11-26T12:00",
      closesAt: "2026-11-26T15:00",
    });
  });

  it("rolls over midnight", () => {
    expect(suggestExamWindow(new Date(2026, 10, 26, 23, 10))).toEqual({
      opensAt: "2026-11-27T00:00",
      closesAt: "2026-11-27T03:00",
    });
  });
});

describe("closesBeforeOpens", () => {
  it("flags a close at or before the open once both have a time", () => {
    expect(closesBeforeOpens("2026-11-26T12:00", "2026-11-26T12:00")).toBe(true);
    expect(closesBeforeOpens("2026-11-26T12:00", "2026-11-26T11:00")).toBe(true);
    expect(closesBeforeOpens("2026-11-26T12:00", "2026-11-26T12:30")).toBe(false);
  });

  it("ignores a value that is still only a date", () => {
    expect(closesBeforeOpens("2026-11-26", "2026-11-26T11:00")).toBe(false);
    expect(closesBeforeOpens("2026-11-26T12:00", "2026-11-26")).toBe(false);
  });
});

describe("closeAfterOpenChange", () => {
  it("moves the close three hours after a later open and leaves a valid close alone", () => {
    expect(closeAfterOpenChange("2026-11-26T14:00", "2026-11-26T13:00")).toBe("2026-11-26T17:00");
    expect(closeAfterOpenChange("2026-11-26T14:00", "2026-11-26T18:00")).toBe("2026-11-26T18:00");
    expect(closeAfterOpenChange("2026-11-26", "2026-11-26T13:00")).toBe("2026-11-26T13:00");
  });
});

describe("formatExamWindow", () => {
  const units = { day: "d", hour: "h", minute: "min" };

  it("spells out the length between open and close", () => {
    expect(formatExamWindow("2026-11-26T09:00", "2026-11-26T15:00", units)).toBe("6 h");
    expect(formatExamWindow("2026-11-26T09:00", "2026-11-27T11:30", units)).toBe("1 d 2 h 30 min");
    expect(formatExamWindow("2026-11-26T09:00", "2026-11-26T09:45", units)).toBe("45 min");
  });

  it("gives nothing while a time is missing or the close is not after the open", () => {
    expect(formatExamWindow("2026-11-26", "2026-11-26T15:00", units)).toBeNull();
    expect(formatExamWindow("2026-11-26T15:00", "2026-11-26T09:00", units)).toBeNull();
  });
});
