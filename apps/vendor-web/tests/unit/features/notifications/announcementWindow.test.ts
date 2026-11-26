import { describe, expect, it } from "vitest";
import {
  announcementDateGap,
  announcementWindowInvalid,
  toIsoValue,
  toLocalValue,
} from "../../../../features/notifications/announcementWindow";

describe("announcementWindowInvalid", () => {
  it("accepts no period at all, a start alone, and an end after the start", () => {
    expect(announcementWindowInvalid("", "")).toBe(false);
    expect(announcementWindowInvalid("2026-11-26T04:20", "")).toBe(false);
    expect(announcementWindowInvalid("2026-11-26T04:20", "2026-11-26T05:00")).toBe(false);
  });

  it("refuses an end that is not after the start, which is what the server refuses too", () => {
    expect(announcementWindowInvalid("2026-11-26T04:20", "2026-11-25T03:20")).toBe(true);
    expect(announcementWindowInvalid("2026-11-26T04:20", "2026-11-26T04:20")).toBe(true);
  });

  it("refuses an end with no start", () => {
    expect(announcementWindowInvalid("", "2026-11-26T04:20")).toBe(true);
  });
});

describe("half-filled date-and-time fields", () => {
  it("says what is missing: a date without a time, or a time without a date", () => {
    expect(announcementDateGap("")).toBeNull();
    expect(announcementDateGap("2026-11-26T03:00")).toBeNull();
    expect(announcementDateGap("2026-11-26")).toBe("TIME_REQUIRED");
    expect(announcementDateGap("T03:00")).toBe("DATE_REQUIRED");
  });

  it("sends nothing for a half-filled field instead of guessing a time (a bare date would be read as UTC midnight)", () => {
    expect(toIsoValue("2026-11-26")).toBeNull();
    expect(toIsoValue("T03:00")).toBeNull();
    expect(toIsoValue("")).toBeNull();
  });
});

describe("local time round trip", () => {
  it("shows a stored instant as the same wall-clock time that was typed, in any time zone", () => {
    for (const typed of ["2026-11-26T03:00", "2026-11-27T08:20", "2026-01-01T00:00", "2026-12-31T23:59"]) {
      expect(toLocalValue(toIsoValue(typed))).toBe(typed);
    }
    expect(toLocalValue(null)).toBe("");
  });
});
