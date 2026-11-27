import { describe, expect, it } from "vitest";
import { formatReviewWindow } from "../../../../../features/exams/utils/reviewWindow";

const units = { day: "d", hour: "h", minute: "min" };

describe("formatReviewWindow", () => {
  it("shows the date once when the exam opens and closes the same day", () => {
    expect(formatReviewWindow("2026-11-26T09:00", "2026-11-26T15:00", units)).toBe(
      "26/11/2026 · 09:00 → 15:00 (6 h)",
    );
  });

  it("shows both dates when the exam runs past midnight", () => {
    expect(formatReviewWindow("2026-11-26T22:00", "2026-11-27T01:30", units)).toBe(
      "26/11/2026 22:00 → 27/11/2026 01:30 (3 h 30 min)",
    );
  });

  it("is empty while a time is missing", () => {
    expect(formatReviewWindow("2026-11-26", "2026-11-26T15:00", units)).toBe("");
  });
});
