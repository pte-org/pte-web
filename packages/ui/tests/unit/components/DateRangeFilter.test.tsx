import { describe, expect, it } from "vitest";
import { standardDateRangePresets } from "../../../src/components/DateRangeFilter";

const LABELS = { last7: "7", last30: "30", thisMonth: "month" };

describe("standardDateRangePresets", () => {
  // 2026-10-29 03:00 UTC is 10:00 on the same day in Vietnam.
  const now = new Date("2026-10-29T03:00:00Z");

  it("offers the last 7 days, the last 30 days and this month, ending today in Vietnam", () => {
    expect(standardDateRangePresets(now, LABELS)).toEqual([
      { key: "last7", label: "7", from: "2026-10-23", to: "2026-10-29" },
      { key: "last30", label: "30", from: "2026-09-30", to: "2026-10-29" },
      { key: "thisMonth", label: "month", from: "2026-10-01", to: "2026-10-29" },
    ]);
  });

  it("uses the Vietnam calendar day, which is already tomorrow late in the evening UTC", () => {
    const late = new Date("2026-10-29T20:00:00Z"); // 03:00 on the 30th in Vietnam
    expect(standardDateRangePresets(late, LABELS)[2]).toMatchObject({ from: "2026-10-01", to: "2026-10-30" });
  });
});
