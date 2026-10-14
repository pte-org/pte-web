import { describe, expect, it } from "vitest";
import { getExamScheduleTimingState } from "./examScheduleTiming";

const NOW = Date.parse("2026-10-13T10:00:00.000Z");
const openSession = {
  status: "OPEN" as const,
  opensAt: "2026-10-13T09:00:00.000Z",
};

describe("getExamScheduleTimingState", () => {
  it("allows a later close time for an open exam", () => {
    expect(
      getExamScheduleTimingState(
        openSession,
        "2026-10-13T11:00:00.000Z",
        "2026-10-13T12:00:00.000Z",
        NOW,
      ),
    ).toBe("CLOSE_TIME_EXTENDED");
  });

  it("detects a shortened close time for an open exam", () => {
    expect(
      getExamScheduleTimingState(
        openSession,
        "2026-10-13T11:00:00.000Z",
        "2026-10-13T10:30:00.000Z",
        NOW,
      ),
    ).toBe("CLOSE_TIME_SHORTENED");
  });

  it("blocks a close time at or before the current time", () => {
    expect(
      getExamScheduleTimingState(
        openSession,
        "2026-10-13T11:00:00.000Z",
        "2026-10-13T10:00:00.000Z",
        NOW,
      ),
    ).toBe("CLOSE_TIME_NOT_IN_FUTURE");
  });

  it("keeps the reminder state when the close time is unchanged", () => {
    expect(
      getExamScheduleTimingState(
        openSession,
        "2026-10-13T11:00:00.000Z",
        "2026-10-13T11:00:00.000Z",
        NOW,
      ),
    ).toBe("CLOSE_TIME_UNCHANGED");
  });

  it("does not apply active-exam rules before a scheduled exam starts", () => {
    expect(
      getExamScheduleTimingState(
        { status: "SCHEDULED", opensAt: "2026-10-13T12:00:00.000Z" },
        "2026-10-13T13:00:00.000Z",
        "2026-10-13T12:30:00.000Z",
        NOW,
      ),
    ).toBe("NOT_APPLICABLE");
  });
});
